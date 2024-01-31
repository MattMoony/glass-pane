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

-- ====================================================================================================================================================== --

CREATE TABLE organ (
    oid             BIGSERIAL,

    PRIMARY KEY     (oid)
);

CREATE TABLE organ_source (
    sid             BIGSERIAL,
    organ           BIGINT              REFERENCES organ(oid),
    url             TEXT                NOT NULL,

    PRIMARY KEY     (sid)
);

CREATE TABLE organization (
    oid             BIGINT              REFERENCES organ(oid),
    name            VARCHAR(128)        NOT NULL,
    established     DATE,
    dissolved       DATE,

    PRIMARY KEY     (oid)
);

CREATE TABLE nation (
    nid             BIGINT              REFERENCES organization(oid),

    PRIMARY KEY     (nid)
);

CREATE TABLE business (
    bid             BIGINT              REFERENCES organization(oid),

    PRIMARY KEY     (bid)
);

CREATE TABLE currency (
    cid             BIGSERIAL,
    name            VARCHAR(64)         NOT NULL,
    symbol          VARCHAR(2)          NOT NULL,

    PRIMARY KEY     (cid)
);

CREATE TABLE role (
    rid             BIGSERIAL,
    name            VARCHAR(128)        NOT NULL,

    PRIMARY KEY     (rid)
);

CREATE TABLE location (
    lid             BIGINT              REFERENCES organ(oid),
    name            VARCHAR(128)        NOT NULL,
    coords          POINT,

    PRIMARY KEY     (lid)
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

-- ====================================================================================================================================================== --

CREATE TABLE membership (
    organ           BIGINT              REFERENCES organ(oid),
    organization    BIGINT              REFERENCES organization(oid),
    role            BIGINT              REFERENCES role(rid),
    since           DATE,
    until           DATE,
    
    PRIMARY KEY     (organ, organization, role, since)
);

CREATE TABLE membership_source (
    sid             BIGSERIAL,
    organ           BIGINT,
    organization    BIGINT,
    role            BIGINT,
    since           DATE,
    url             TEXT                NOT NULL,

    FOREIGN KEY     (organ, organization, role, since) REFERENCES membership(organ, organization, role, since),
    PRIMARY KEY     (sid)
);

CREATE TABLE relation (
    person          BIGINT              REFERENCES person(pid),
    relative        BIGINT              REFERENCES person(pid),
    relation        BIGINT              REFERENCES relation_type(rtid),
    since           DATE,
    until           DATE,

    PRIMARY KEY     (person, relative, since)
);

CREATE TABLE relation_source (
    sid             BIGSERIAL,
    person          BIGINT,
    relative        BIGINT,
    since           DATE,
    url             TEXT                NOT NULL,

    FOREIGN KEY     (person, relative, since) REFERENCES relation(person, relative, since),
    PRIMARY KEY     (sid)
);

CREATE TABLE business_turnover (
    business        BIGINT              REFERENCES business(bid),
    byear           INTEGER,
    turnover        DOUBLE PRECISION    NOT NULL,
    currency    	BIGINT              REFERENCES currency(cid) NOT NULL,

    PRIMARY KEY     (business, byear)
);

CREATE TABLE business_turnover_source (
    sid             BIGSERIAL,
    business        BIGINT,
    byear           INTEGER,
    url             TEXT                NOT NULL,

    FOREIGN KEY     (business, byear) REFERENCES business_turnover(business, byear),
    PRIMARY KEY     (sid)
);

-- ====================================================================================================================================================== --

INSERT INTO     relation_type (rtid, name)
VALUES          (1, 'parent'),
                (2, 'romantic'),
                (3, 'friend');
