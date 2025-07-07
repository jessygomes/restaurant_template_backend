/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/mailer.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { CreateReservationAdminDto } from './dto/create-reservation-admin.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  //! RESERVER UNE TABLE
  async createReservation(dto: CreateReservationDto) {
    console.log('Création de réservation côté client:', dto);
    try {
      // Vérifier si le client existe déjà dans la base de données
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.client.email },
      });

      // Créer un client avec les informations fournies
      const client =
        existingClient ??
        (await this.prisma.client.create({
          data: {
            email: dto.client.email,
            firstName: dto.client.firstName,
            lastName: dto.client.lastName,
            phone: dto.client.phone,
            userId: dto.userId,
          },
        }));

      const date = new Date(dto.date);
      const arrival = new Date(`${dto.date}T${dto.arrivalTime}`); // date complète avec l’heure

      // Vérifier si une réservation existe déjà pour cette date et heure
      const existingReservation = await this.prisma.reservation.findFirst({
        where: {
          date: new Date(dto.date),
          arrivalTime: arrival,
          clientId: client.id,
        },
      });

      if (existingReservation) {
        throw new Error(
          'Une réservation existe déjà pour cette date et heure.',
        );
      }

      // Créer une nouvelle réservation
      const reservation = await this.prisma.reservation.create({
        data: {
          date,
          arrivalTime: arrival,
          guests: dto.guests,
          userId: dto.userId,
          clientId: client.id,
          status: 'Attente', // Enum
          isFinished: false, // Indiquer que le client n'est pas terminé
        },
      });

      console.log('Réservation créée:', reservation);

      await this.mailService.sendMail({
        to: 'inthegleam01@gmail.com',
        subject: 'NOUVELLE DEMANDE DE RESERVATION 🍽️',
        html: `
            <h2>Bonjour,</h2>
            <p>Votre avez une nouvelle demande de réservation.</p>
            <ul>
              <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
              <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Nombre de personnes :</strong> ${reservation.guests}</li>
            </ul>
            <p>Confirmez la réservation depuis l'espace Administration !</p>
          `,
      });

      return reservation;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error('Erreur lors de la création de la réservation');
    }
  }

  //! CONFIMER UNE RESERVATION
  async confirmReservation(dto: ConfirmReservationDto) {
    try {
      const { reservationId, status, tableIds } = dto;

      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          tables: true,
          client: true,
          user: true,
        },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation introuvable');
      }

      if (status === 'Confirmée') {
        if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
          throw new BadRequestException('Aucune table sélectionnée');
        }

        // Vérifie que les tables sont libres
        const conflictingTables = await this.prisma.reservationOnTable.findMany(
          {
            where: {
              tableId: { in: tableIds },
              reservation: {
                date: reservation.date,
                arrivalTime: reservation.arrivalTime,
                status: 'Confirmée',
                isFinished: false, // Exclure les réservations terminées
              },
            },
          },
        );

        if (conflictingTables.length > 0) {
          throw new ConflictException(
            'Une ou plusieurs tables sont déjà réservées à cette heure.',
          );
        }

        // Réassocier les tables : d'abord vider
        await this.prisma.reservationOnTable.deleteMany({
          where: { reservationId: dto.reservationId },
        });

        // Puis recréer
        await this.prisma.reservationOnTable.createMany({
          data: tableIds.map((tableId) => ({
            reservationId: dto.reservationId,
            tableId,
          })),
        });

        // Envoi d'email
        if (reservation.client?.email) {
          await this.mailService.sendMail({
            to: reservation.client.email,
            subject: 'Votre réservation est confirmée 🍽️',
            html: `
            <h2>Bonjour ${reservation.client.firstName},</h2>
            <p>Votre réservation au restaurant <strong>${reservation.user?.restaurantName ?? 'notre établissement'}</strong> est bien confirmée.</p>
            <ul>
              <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
              <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Nombre de personnes :</strong> ${reservation.guests}</li>
            </ul>
            <p>Nous vous remercions pour votre confiance et vous attendons avec plaisir !</p>
          `,
          });
        }
      }

      // Mise à jour du statut uniquement (dans tous les cas)
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: dto.status },
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      throw new Error('Erreur lors de la confirmation de la réservation');
    }
  }

  //! RESERVER UNE TABLE COTE RESTAURATEUR
  async createReservationByAdmin(dto: CreateReservationAdminDto) {
    console.log('Création de réservation côté admin:', dto);
    try {
      // Vérifier si le client existe déjà dans la base de données
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.client.email },
      });

      const client =
        existingClient ??
        (await this.prisma.client.create({
          data: {
            email: dto.client.email,
            firstName: dto.client.firstName,
            lastName: dto.client.lastName,
            phone: dto.client.phone,
            userId: dto.userId,
          },
        }));

      const date = new Date(dto.date);
      const arrival = new Date(`${dto.date}T${dto.arrivalTime}`); // date complète avec l’heure

      // Vérifier que les tables ne sont pas déjà occupées à cette heure
      const conflicts = await this.prisma.reservationOnTable.findMany({
        where: {
          tableId: { in: dto.tableIds },
          reservation: {
            date,
            arrivalTime: arrival,
            status: 'Confirmée',
            isFinished: false, // Exclure les réservations terminées
          },
        },
      });

      if (conflicts.length > 0) {
        throw new ConflictException(
          'Certaines tables sont déjà réservées à cette heure.',
        );
      }

      const reservation = await this.prisma.reservation.create({
        data: {
          date,
          arrivalTime: arrival,
          guests: dto.guests,
          status: 'Confirmée',
          userId: dto.userId,
          clientId: client.id,
        },
      });

      // Liaison des tables
      await this.prisma.reservationOnTable.createMany({
        data: dto.tableIds.map((tableId) => ({
          reservationId: reservation.id,
          tableId,
        })),
      });

      // Envoi de l’email de confirmation
      await this.mailService.sendMail({
        to: client.email,
        subject: 'Confirmation de votre réservation',
        html: `
      <h2>Bonjour ${client.firstName},</h2>
      <p>Votre réservation au restaurant ${reservation.userId} est confirmée pour le <strong>${date.toLocaleDateString()}</strong> à <strong>${arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
      <p>Nombre de personnes : ${dto.guests}</p>
      <p>Merci et à très bientôt !</p>
    `,
      });

      return { success: true, reservationId: reservation.id };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error('Erreur lors de la création de la réservation');
    }
  }

  //! MODIFIER UNE RESERVATION
  async updateReservation(resaId: string, dto: UpdateReservationDto) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: resaId },
        include: {
          tables: true,
        },
      });

      if (!reservation) throw new NotFoundException('Réservation introuvable');

      const date = dto.date ? new Date(dto.date) : reservation.date;

      const arrivalTime =
        dto.arrivalTime && dto.date
          ? new Date(`${dto.date}T${dto.arrivalTime}:00`)
          : reservation.arrivalTime;

      // Vérification des conflits si les tables sont changées
      if (dto.tableIds && dto.tableIds.length > 0) {
        const conflicts = await this.prisma.reservationOnTable.findMany({
          where: {
            tableId: { in: dto.tableIds },
            reservation: {
              NOT: { id: resaId }, // Exclure cette résa
              date,
              arrivalTime,
              status: reservation.status, // Vérifier le même statut
              isFinished: false, // Exclure les réservations terminées
            },
          },
        });

        if (conflicts.length > 0) {
          throw new ConflictException(
            'Une ou plusieurs tables sont déjà réservées à cette heure.',
          );
        }

        // Supprimer les anciennes tables
        await this.prisma.reservationOnTable.deleteMany({
          where: { reservationId: resaId },
        });

        // Ajouter les nouvelles tables
        await this.prisma.reservationOnTable.createMany({
          data: dto.tableIds.map((tableId) => ({
            reservationId: resaId,
            tableId,
          })),
        });
      }

      // Modifier les infos du client si nécessaire
      if (dto.client) {
        const existingClient = await this.prisma.client.findUnique({
          where: { email: dto.client.email },
        });

        if (existingClient) {
          // Vérifier si les données ont changé avant de faire la mise à jour
          const hasChanged =
            existingClient.firstName !== dto.client.firstName ||
            existingClient.lastName !== dto.client.lastName ||
            existingClient.phone !== dto.client.phone ||
            existingClient.email !== dto.client.email;

          if (hasChanged) {
            // Mettre à jour le client existant seulement si nécessaire
            await this.prisma.client.update({
              where: { id: existingClient.id },
              data: {
                firstName: dto.client.firstName,
                lastName: dto.client.lastName,
                phone: dto.client.phone,
                email: dto.client.email,
              },
            });
          }
        } else {
          // Créer un nouveau client
          const newClient = await this.prisma.client.create({
            data: {
              email: dto.client.email,
              firstName: dto.client.firstName,
              lastName: dto.client.lastName,
              phone: dto.client.phone,
              userId: reservation.userId, // Associer au même utilisateur
            },
          });
          // Mettre à jour la réservation avec le nouvel ID client
          await this.prisma.reservation.update({
            where: { id: resaId },
            data: { clientId: newClient.id },
          });
        }
      }

      // Mise à jour de la réservation
      await this.prisma.reservation.update({
        where: { id: resaId },
        data: {
          date,
          arrivalTime,
          guests: dto.guests ?? reservation.guests,
          status: dto.status ?? reservation.status, // Garder le statut actuel si non fourni
          isFinished: dto.isFinished ?? reservation.isFinished, // Garder l'état terminé si non fourni
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      throw new Error('Erreur lors de la mise à jour de la réservation');
    }
  }

  //! CLOTURER UNE RESERVATION (côté admin)
  async closeReservation(reservationId: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation introuvable');
      }

      if (reservation.isFinished) {
        throw new BadRequestException('La réservation est déjà clôturée');
      }

      // Mettre à jour le statut
      await this.prisma.reservation.update({
        where: { id: reservationId },
        data: { isFinished: true },
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la clôture de la réservation:', error);
      throw new Error('Erreur lors de la clôture de la réservation');
    }
  }

  //! ANNULER UNE RESERVATION (donner une raison ou pas)
  async cancelReservation(dto: CancelReservationDto) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
        include: {
          client: true,
          user: true,
          tables: true,
        },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation introuvable');
      }

      if (reservation.status === 'Annulée') {
        throw new BadRequestException('La réservation est déjà annulée');
      }

      // Mettre à jour le statut
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: 'Annulée' },
      });

      // Supprimer les liens aux tables (nettoyage logique)
      await this.prisma.reservationOnTable.deleteMany({
        where: { reservationId: dto.reservationId },
      });

      // Envoi d’un e-mail au client
      if (reservation.client?.email) {
        await this.mailService.sendMail({
          to: reservation.client.email,
          subject: 'Annulation de votre réservation ❌',
          html: `
            <h2>Bonjour ${reservation.client.firstName},</h2>
            <p>Nous vous informons que votre réservation au restaurant <strong>${reservation.user?.restaurantName ?? 'notre établissement'}</strong> a été <strong>annulée</strong>.</p>
            <ul>
              <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
              <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
            </ul>
            ${dto.reason ? `<p><strong>Motif :</strong> ${dto.reason}</p>` : ''}
            <p>Nous restons à votre disposition pour toute nouvelle réservation.</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      throw new Error("Erreur lors de l'annulation de la réservation");
    }
  }

  //! VOIR TOUTES MES RESERVATIONS EN FONCTION DU JOUR
  async getReservationsByDay(userId: string, date: string) {
    const targetDate = new Date(date);

    // Optionnel : s’assurer qu’on ne récupère que les résas de ce jour-là
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.reservation.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        client: true,
        tables: {
          include: { table: true },
        },
      },
      orderBy: {
        arrivalTime: 'asc',
      },
    });
  }

  //! VOIR TOUTES MES RESERVATIONS
  async getAllReservations() {
    return this.prisma.reservation.findMany({
      include: {
        client: true,
        tables: {
          include: { table: true },
        },
      },
      orderBy: {
        arrivalTime: 'asc',
      },
    });
  }

  //! VOIR UNE SEULE RESERVATION
  async getReservationById(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        client: true,
        tables: {
          include: { table: true },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    return reservation;
  }

  //! VOIR TOUTES LES RESERVATIONS D'UN CLIENT
  async getReservationsByClient(clientId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { clientId },
      include: {
        tables: {
          include: { table: true },
        },
      },
    });

    if (!reservations) {
      throw new NotFoundException('Aucune réservation trouvée pour ce client');
    }

    return reservations;
  }

  async deleteReservation(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        client: true,
        user: true,
        tables: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.status === 'Annulée') {
      throw new BadRequestException('La réservation est déjà annulée');
    }

    // Mettre à jour le statut
    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'Annulée' },
    });

    // Supprimer les liens aux tables (nettoyage logique)
    await this.prisma.reservationOnTable.deleteMany({
      where: { reservationId },
    });

    // Envoi d’un e-mail au client
    if (reservation.client?.email) {
      await this.mailService.sendMail({
        to: reservation.client.email,
        subject: 'Annulation de votre réservation ❌',
        html: `
          <h2>Bonjour ${reservation.client.firstName},</h2>
          <p>Nous vous informons que votre réservation au restaurant <strong>${reservation.user?.restaurantName ?? 'notre établissement'}</strong> a été <strong>annulée</strong>.</p>
          <ul>
            <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
            <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
          </ul>

          <p>Nous restons à votre disposition pour toute nouvelle réservation.</p>
        `,
      });
    }

    await this.prisma.reservation.delete({
      where: { id: reservationId },
    });

    return { success: true };
  }
}
