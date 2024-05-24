import Person from "@/models/Person";
import Relation from "@/models/Relation";
import Organization from "@/models/Organization";
import Membership from "@/models/Membership";
import RelationType, { COLORS } from "@/models/RelationTypes";
import Role from "@/models/Role";

/**
 * Represents a Cytoscape node.
 */
class Node {
  public data: {
    id: string;
    label: string;
    parent?: string;
  };

  constructor (id: number, label: string, parent?: string) {
    this.data = {
      id: id.toString(),
      label,
      ...(parent ? {parent,} : {}),
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
    type: string;
    parent?: string;
  };

  constructor (person: Person, parentNode?: any) {
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
      type: 'person',
      ...(parentNode ? {parent: parentNode.data.id,} : {}),
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
    color: string;
    type: string;
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
      id: `r-${this.id}-${person.id}-${this.other.id}`,
      label: RelationType[this.type].toLowerCase(),
      ...(this.type === RelationType.CHILD
        ? { source: this.other.id.toString(), target: person.id.toString() }
        : { source: person.id.toString(), target: this.other.id.toString() }
      ),
      color: COLORS[this.type],
      type: 'relation',
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
    type: string;
    parent?: string;
  };

  constructor (organization: Organization, parentNode?: any) {
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
      type: 'organization',
      ...(parentNode ? {parent: parentNode.data.id,} : {}),
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
    color: string;
    type: string;
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
      id: `m-${this.id}-${this.organ.id}-${this.organization.id}`,
      label: this.role.name,
      source: this.organ.id.toString(),
      target: this.organization.id.toString(),
      color: 'rgba(84, 84, 84, 0.48)',
      type: 'membership',
    };
  }
}

/**
 * Group memberships into compound nodes.
 */
export const groupMemberships = (memberships: Membership[]) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, [Role, Membership[]]>();
  memberships.forEach((m) => {
    if (!grouped.has(m.role.id)) grouped.set(m.role.id, [m.role, []]);
    grouped.get(m.role.id)![1].push(m);
  });
  for (const [role, ms] of grouped) {
    if (ms[1].length > 1) {
      const group = { 
        data: {
          id: `${ms[1][0].organ.id}-${ms[0].name.toString()}`,
          label: ms[0].name.toString(),
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        },
      };
      nodes.push(group);
      ms[1].forEach((m) => {
        const organization = new OrganizationNode(m.organization, group);
        nodes.push(organization);
      });
      edges.push({ 
        data: {
          id: `edge-${group.data.id}`, 
          source: ms[1][0].organ.id, 
          target: group.data.id,
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
        },
      });
    } else {
      const membership = new MembershipEdge(ms[1][0]);
      nodes.push(new OrganizationNode(ms[1][0].organization));
      edges.push(membership);
    }
  }
  return [nodes, edges];
};

/**
 * Group members into compound nodes.
 */
export const groupMembers = (members: Membership[]) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, [Role, Membership[]]>();
  members.forEach((m) => {
    if (!grouped.has(m.role.id)) grouped.set(m.role.id, [m.role, []]);
    grouped.get(m.role.id)![1].push(m);
  });
  for (const [role, ms] of grouped) {
    if (ms[1].length > 1) {
      const group = { 
        data: {
          id: `${ms[1][0].organization.id}-${ms[0].name.toString()}`,
          label: ms[0].name.toString(),
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        },
      };
      nodes.push(group);
      ms[1].forEach((m) => {
        const person = m.organ instanceof Person 
                       ? new PersonNode(m.organ, group) 
                       : new OrganizationNode(m.organ as Organization, group);
        nodes.push(person);
      });
      edges.push({ 
        data: {
          id: `edge-${group.data.id}`,
          source: group.data.id, 
          target: ms[1][0].organization.id,
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
        },
      });
    } else {
      const membership = new MembershipEdge(ms[1][0]);
      nodes.push(ms[1][0].organ instanceof Person 
                 ? new PersonNode(ms[1][0].organ as Person) 
                 : new OrganizationNode(ms[1][0].organ as Organization));
      edges.push(membership);
    }
  }
  return [nodes, edges];
};

export const groupRelations = (relations: Relation[], person: Person) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, Relation[]>();
  relations.forEach((r) => {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  });
  for (const [type, rs] of grouped) {
    if (rs.length > 1) {
      const group = { 
        data: {
          id: `${person.id}-${RelationType[type].toLowerCase()}`,
          label: RelationType[type].toLowerCase(),
          color: COLORS[type as RelationType],
        },
      };
      nodes.push(group);
      rs.forEach((r) => {
        const person = new PersonNode(r.other, group);
        nodes.push(person);
      });
      edges.push({ 
        data: {
          id: `edge-${group.data.id}`, 
          source: group.data.id, 
          target: person.id,
          color: COLORS[type as RelationType],
        },
      });
    } else {
      const relation = new RelationEdge(rs[0], person);
      nodes.push(new PersonNode(rs[0].other));
      edges.push(relation);
    }
  }
  return [nodes, edges];
};
