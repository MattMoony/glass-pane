import Person from "@/models/Person";
import Relation from "@/models/Relation";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
import RelationType from "@/models/RelationTypes";

/**
 * Represents a Cytoscape node.
 */
class Node {
  public data: {
    id: string;
    label: string;
  };

  constructor (id: number, label: string) {
    this.data = {
      id: id.toString(),
      label,
    };
  }
}

/**
 * Represents a Cytoscape edge.
 */
class Edge {
  public data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };

  constructor (id: number, source: number, target: number, label: string) {
    this.data = {
      id: id.toString(),
      source: source.toString(),
      target: target.toString(),
      label,
    };
  }
}

/**
 * A node of a person in the graph.
 */
export class PersonNode extends Person {
  public data: {
    id: string;
    label: string;
    image: string;
  };

  constructor (person: Person) {
    super(
      person.id,
      person.bio,
      person.firstname,
      person.lastname,
      person.birthdate,
      person.deathdate,
    );
    this.data = {
      id: this.id.toString(),
      label: this.firstname + " " + this.lastname,
      image: this.pic.src(),
    };
  }
}

/**
 * An edge of a relation between people.
 */
export class RelationEdge extends Relation {
  public data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };

  constructor (relation: Relation, person: Person) {
    super(
      relation.id,
      relation.type,
      relation.other,
      relation.since,
      relation.until,
    );
    this.data = {
      id: this.id.toString(),
      label: RelationType[this.type].toLowerCase(),
      ...(this.type === RelationType.CHILD
        ? { source: this.other.toString(), target: person.id.toString() }
        : { source: person.id.toString(), target: this.other.toString() }
      ),
    };
  }
}

/**
 * A node of an organization in the graph.
 */
export class OrganizationNode extends Organization {
  public data: {
    id: string;
    label: string;
    image: string;
  };

  constructor (organization: Organization) {
    super(
      organization.id,
      organization.bio,
      organization.name,
      organization.established,
      organization.dissolved,
    );
    this.data = {
      id: this.id.toString(),
      label: this.name,
      image: this.pic.src(),
    };
  }
}

/**
 * An edge of a membership between an organ 
 * and an organization.
 */
export class MembershipEdge extends Membership {
  public data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };

  constructor (membership: Membership) {
    super(
      membership.id,
      membership.organ,
      membership.organization,
      membership.role,
      membership.since,
      membership.until,
    )
    this.data = {
      id: `${this.id}-${this.organ.id.toString()}-${this.organization.id.toString()}`,
      label: this.role.name,
      source: this.organ.id.toString(),
      target: this.organization.id.toString(),
    };
  }
}
