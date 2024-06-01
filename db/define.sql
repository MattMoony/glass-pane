-- ====================================================================================================================================================== --

DROP TABLE business_turnover_source;
DROP TABLE business_turnover;
DROP TABLE relation_source;
DROP TABLE relation;
DROP TABLE membership_source;
DROP TABLE membership;
DROP TABLE organ_source;
DROP TABLE payment_donee;
DROP TABLE payment_donor;
DROP TABLE event_source;
DROP TABLE event_participant;
DROP TABLE organ_tag;
DROP TABLE payment;
DROP TABLE event;
DROP TABLE socials_follower;
DROP TABLE socials;
DROP TABLE socials_platforms;
DROP TABLE relation_type;
DROP TABLE person;
DROP TABLE role;
DROP TABLE currency;
DROP TABLE business;
DROP TABLE nation;
DROP TABLE organization;
DROP TABLE location;
DROP TABLE tag;
DROP TABLE organ;
DROP TABLE users;

-- ====================================================================================================================================================== --

CREATE TABLE users (
    uid             BIGSERIAL,
    username        VARCHAR(32)        UNIQUE NOT NULL,
    password        VARCHAR(161)       NOT NULL,

    PRIMARY KEY     (uid)
);

CREATE TABLE organ (
    oid             BIGSERIAL,

    PRIMARY KEY     (oid)
);

CREATE TABLE tag (
    tid             BIGSERIAL,
    name            VARCHAR(128)        NOT NULL,

    PRIMARY KEY     (tid)
);

CREATE TABLE location (
    lid             BIGSERIAL,
    name            VARCHAR(256)        NOT NULL,
    coords          POINT,

    PRIMARY KEY     (lid)
);

CREATE TABLE organization (
    oid             BIGINT              REFERENCES organ(oid),
    name            VARCHAR(128)        NOT NULL,
    established     DATE,
    dissolved       DATE,
    location        BIGINT              REFERENCES location(lid),

    PRIMARY KEY     (oid)
);

CREATE TABLE nation (
    nid             BIGINT              REFERENCES organization(oid),
    location        BIGINT              REFERENCES location(lid),

    PRIMARY KEY     (nid)
);

CREATE TABLE business (
    bid             BIGINT              REFERENCES organization(oid),

    PRIMARY KEY     (bid)
);

CREATE TABLE currency (
    cid             BIGSERIAL,
    name            VARCHAR(64)         NOT NULL,
    symbol          VARCHAR(3)          NOT NULL,

    PRIMARY KEY     (cid)
);

CREATE TABLE role (
    rid             BIGSERIAL,
    name            VARCHAR(128)        NOT NULL,

    PRIMARY KEY     (rid)
);

CREATE TABLE person (
    pid             BIGINT              REFERENCES organ(oid),
    firstname       VARCHAR(128)        NOT NULL,
    lastname        VARCHAR(128)        NOT NULL,
    birthdate       DATE,
    deathdate       DATE,
    birthplace      BIGINT              REFERENCES location(lid),
    birthnation     BIGINT              REFERENCES nation(nid),

    PRIMARY KEY     (pid)
);

CREATE TABLE relation_type (
    rtid            BIGSERIAL,
    name            VARCHAR(16)         NOT NULL,

    PRIMARY KEY     (rtid)
);

CREATE TABLE event (
    eid             BIGSERIAL,
    name            VARCHAR(128)        NOT NULL,
    date            DATE,
    location        BIGINT              REFERENCES location(lid),

    PRIMARY KEY     (eid)
);

CREATE TABLE payment (
    pid             BIGINT             REFERENCES event(eid),
    amount          DOUBLE PRECISION   NOT NULL,
    currency        BIGINT             REFERENCES currency(cid) NOT NULL,

    PRIMARY KEY    (pid)
);

-- ====================================================================================================================================================== --

CREATE TABLE organ_tag (
    tid             BIGINT              REFERENCES tag(tid) NOT NULL,
    organ           BIGINT              REFERENCES organ(oid) NOT NULL,

    PRIMARY KEY     (tid, organ)
);

CREATE TABLE event_participant (
    pid             BIGSERIAL,
    event           BIGINT              REFERENCES event(eid) NOT NULL,
    organ           BIGINT              REFERENCES organ(oid) NOT NULL,
    role            BIGINT              REFERENCES role(rid) NOT NULL,

    PRIMARY KEY     (pid)
);

CREATE TABLE event_source (
    sid             BIGSERIAL,
    eid             BIGINT              REFERENCES event(eid) NOT NULL,
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

CREATE TABLE payment_donor (
    pid             BIGSERIAL,
    payment         BIGINT              REFERENCES payment(pid) NOT NULL,
    organ           BIGINT              REFERENCES organ(oid) NOT NULL,

    PRIMARY KEY     (pid)
);

CREATE TABLE payment_donee (
    pid             BIGSERIAL,
    payment         BIGINT              REFERENCES payment(pid) NOT NULL,
    organ           BIGINT              REFERENCES organ(oid) NOT NULL,

    PRIMARY KEY     (pid)
);

CREATE TABLE organ_source (
    sid             BIGSERIAL,
    organ           BIGINT              REFERENCES organ(oid),
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

CREATE TABLE socials_platforms (
    ostid           BIGSERIAL,
    name            VARCHAR(32)         NOT NULL,

    PRIMARY KEY     (ostid)
);

CREATE TABLE socials (
    sid             BIGSERIAL,
    organ           BIGINT              REFERENCES organ(oid),
    url             TEXT                NOT NULL,
    platform        BIGINT              REFERENCES socials_platforms(ostid),

    PRIMARY KEY     (sid)
);

CREATE TABLE socials_follower (
    fid             BIGSERIAL,
    follower        BIGINT              REFERENCES socials(sid) NOT NULL,
    following       BIGINT              REFERENCES socials(sid) NOT NULL,
    since           DATE,
    until           DATE,

    PRIMARY KEY     (fid)
);

CREATE TABLE membership (
    mid             BIGSERIAL,
    organ           BIGINT              REFERENCES organ(oid) NOT NULL,
    organization    BIGINT              REFERENCES organization(oid) NOT NULL,
    role            BIGINT              REFERENCES role(rid) NOT NULL,
    since           DATE,
    until           DATE,
    
    PRIMARY KEY     (mid)
);

CREATE TABLE membership_source (
    sid             BIGSERIAL,
    mid             BIGINT              REFERENCES membership(mid) NOT NULL,
    since           DATE,
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

CREATE TABLE relation (
    rid             BIGSERIAL,
    person          BIGINT              REFERENCES person(pid),
    relative        BIGINT              REFERENCES person(pid),
    relation        BIGINT              REFERENCES relation_type(rtid),
    since           DATE,
    until           DATE,

    PRIMARY KEY     (rid)
);

CREATE TABLE relation_source (
    sid             BIGSERIAL,
    rid             BIGINT              REFERENCES relation(rid) NOT NULL,
    person          BIGINT,
    relative        BIGINT,
    since           DATE,
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

CREATE TABLE business_turnover (
    tid             BIGSERIAL,
    business        BIGINT              REFERENCES business(bid),
    byear           INTEGER             NOT NULL,
    turnover        DOUBLE PRECISION    NOT NULL,
    currency    	BIGINT              REFERENCES currency(cid) NOT NULL,

    PRIMARY KEY     (tid)
);

CREATE TABLE business_turnover_source (
    sid             BIGSERIAL,
    tid             BIGINT              REFERENCES business_turnover(tid) NOT NULL,
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

-- ====================================================================================================================================================== --

INSERT INTO     relation_type (rtid, name)
VALUES          (1, 'parent'),
                (2, 'romantic'),
                (3, 'friend');

INSERT INTO     socials_platforms (ostid, name)
VALUES          (1, 'other'),
                (2, 'email'),
                (3, 'phone'),
                (4, 'facebook'),
                (5, 'instagram'),
                (6, 'twitter'),
                (7, 'telegram'),
                (8, 'youtube'),
                (9, 'tiktok'),
                (10, 'linkedin'),
                (11, 'xing'),
                (12, 'website');

INSERT INTO     currency (cid, name, symbol)
VALUES          (1, 'Euro', '€'),
                (2, 'US Dollar', '$'),
                (3, 'British Pound', '£'),
                (4, 'Swiss Franc', 'CHF'),
                (5, 'Japanese Yen', '¥'),
                (6, 'Chinese Yuan', '¥'),
                (7, 'Russian Ruble', '₽'),
                (8, 'Indian Rupee', '₹'),
                (9, 'Brazilian Real', 'R$'),
                (10, 'South African Rand', 'R'),
                (11, 'Australian Dollar', '$'),
                (12, 'Canadian Dollar', '$'),
                (13, 'New Zealand Dollar', '$'),
                (14, 'Swedish Krona', 'kr'),
                (15, 'Norwegian Krone', 'kr'),
                (16, 'Danish Krone', 'kr'),
                (17, 'Czech Koruna', 'Kč'),
                (18, 'Polish Złoty', 'zł'),
                (19, 'Hungarian Forint', 'Ft'),
                (20, 'Turkish Lira', '₺'),
                (21, 'Ukrainian Hryvnia', '₴');

-- ====================================================================================================================================================== --

GRANT               CONNECT
ON                  DATABASE glasspane
TO                  glasspane;

GRANT               SELECT, INSERT, UPDATE, DELETE 
ON                  ALL TABLES IN SCHEMA public
TO                  glasspane;

GRANT               USAGE, SELECT
ON                  ALL SEQUENCES IN SCHEMA public
TO                  glasspane;
