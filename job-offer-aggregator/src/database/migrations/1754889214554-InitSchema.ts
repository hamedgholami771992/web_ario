import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1754889214554 implements MigrationInterface {
    name = 'InitSchema1754889214554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "providers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d735474e539e674ba3702eddc44" UNIQUE ("name"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "currencies" ("id" SERIAL NOT NULL, "name" character varying, "symbol" character varying, "description" character varying, CONSTRAINT "UQ_976da6960ec4f0c96c26e3dffa0" UNIQUE ("name"), CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "industries" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_447df075c342af02a92901dc810" UNIQUE ("name"), CONSTRAINT "PK_f1626dcb2d58142d7dfcca7b8d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "website" character varying, "industryId" integer, CONSTRAINT "UQ_099e67f13da42a29cbcfb38c64b" UNIQUE ("name"), CONSTRAINT "PK_f2c1aea3e8d7aa3c5fba949c97d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "states" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_fe52f02449eaf27be2b2cb7acda" UNIQUE ("name"), CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "stateId" integer, CONSTRAINT "UQ_a4cb6707b4d50e5ab5401873daa" UNIQUE ("name", "stateId"), CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_e7b3320f76c8a9f4e73dbb191d7" UNIQUE ("name"), CONSTRAINT "PK_87d4226cb676b3b16518977cc7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skills" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_81f05095507fd84aa2769b4a522" UNIQUE ("name"), CONSTRAINT "UQ_81f05095507fd84aa2769b4a522" UNIQUE ("name"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "externalId" character varying NOT NULL, "isRemote" boolean NOT NULL DEFAULT false, "minSalary" numeric, "maxSalary" numeric, "experience" integer, "postedAt" TIMESTAMP NOT NULL, "providerId" integer, "cityId" integer, "jobTypeId" integer, "currencyId" integer, "employerId" integer, CONSTRAINT "UQ_770c857f458510d26ce31dca3ed" UNIQUE ("externalId", "providerId"), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_skills" ("jobId" integer NOT NULL, "skillId" integer NOT NULL, CONSTRAINT "PK_d70ad55609812d9fde4fefe099f" PRIMARY KEY ("jobId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aef367731b3f3e78ea90892fd4" ON "job_skills" ("jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b8d0000c11602550abb8178841" ON "job_skills" ("skillId") `);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_41f70a3359159c180714c66d5bb" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cities" ADD CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_3f7e37aec7a0873cc5c59adc56e" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_b26ab065f22bf249332236df7c5" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_24c30227b3e948d1bce7116d8d7" FOREIGN KEY ("jobTypeId") REFERENCES "job_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_d07ac12c2f76e3cd30d66225150" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_62e3afafda3cf7db0a08982a5b1" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_skills" ADD CONSTRAINT "FK_aef367731b3f3e78ea90892fd47" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "job_skills" ADD CONSTRAINT "FK_b8d0000c11602550abb81788412" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_skills" DROP CONSTRAINT "FK_b8d0000c11602550abb81788412"`);
        await queryRunner.query(`ALTER TABLE "job_skills" DROP CONSTRAINT "FK_aef367731b3f3e78ea90892fd47"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_62e3afafda3cf7db0a08982a5b1"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_d07ac12c2f76e3cd30d66225150"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_24c30227b3e948d1bce7116d8d7"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_b26ab065f22bf249332236df7c5"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_3f7e37aec7a0873cc5c59adc56e"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP CONSTRAINT "FK_ded8a17cd090922d5bac8a2361f"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_41f70a3359159c180714c66d5bb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8d0000c11602550abb8178841"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aef367731b3f3e78ea90892fd4"`);
        await queryRunner.query(`DROP TABLE "job_skills"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "job_types"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "states"`);
        await queryRunner.query(`DROP TABLE "employers"`);
        await queryRunner.query(`DROP TABLE "industries"`);
        await queryRunner.query(`DROP TABLE "currencies"`);
        await queryRunner.query(`DROP TABLE "providers"`);
    }

}
