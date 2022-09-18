import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialise1663488143322 implements MigrationInterface {
    name = 'Initialise1663488143322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "friendships" ("id" SERIAL NOT NULL, "sender" character varying NOT NULL, "senderId" integer NOT NULL, "senderImage" character varying NOT NULL, "receiver" character varying NOT NULL, "receiverId" integer NOT NULL, "receiverImage" character varying NOT NULL, "status" integer NOT NULL DEFAULT '0', "last_message_sent" integer, CONSTRAINT "REL_79d384fb83d493e25ea083634f" UNIQUE ("last_message_sent"), CONSTRAINT "PK_08af97d0be72942681757f07bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "seen" boolean NOT NULL DEFAULT '0', "authorId" integer, "conversationId" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "password" character varying NOT NULL, "image" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT 'No description', "hashedRt" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" integer, "recipientId" integer, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_761a5583cb503b1124b174e13f" ON "conversations" ("creatorId", "recipientId") `);
        await queryRunner.query(`CREATE TABLE "requests" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_79d384fb83d493e25ea083634f4" FOREIGN KEY ("last_message_sent") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_819e6bb0ee78baf73c398dc707f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "friendships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_819e6bb0ee78baf73c398dc707f"`);
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_79d384fb83d493e25ea083634f4"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP INDEX "IDX_761a5583cb503b1124b174e13f"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "friendships"`);
    }

}
