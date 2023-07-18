-- ====================================================================================================================================================== --

CREATE TABLE organ (
    oid             BIGSERIAL,

    PRIMARY KEY     (oid)
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

CREATE TABLE relation (
    person          BIGINT              REFERENCES person(pid),
    relative        BIGINT              REFERENCES person(pid),
    relation        BIGINT              REFERENCES relation_type(rtid),
    since           DATE,
    until           DATE,

    PRIMARY KEY     (person, relative, since)
);

CREATE TABLE business_turnover (
    business        BIGINT              REFERENCES business(bid),
    byear           INTEGER,
    turnover        DOUBLE PRECISION    NOT NULL,
    currency    	BIGINT              REFERENCES currency(cid) NOT NULL,

    PRIMARY KEY     (business, byear)
);

-- ====================================================================================================================================================== --

INSERT INTO     relation_type (name)
VALUES          ('parent'),
                ('romantic'),
                ('friend');
