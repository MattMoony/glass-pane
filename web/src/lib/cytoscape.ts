import cytoscape, { type CytoscapeOptions } from "cytoscape";

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
    og: Node;
    label: string;
    parent?: string;
  };

  constructor (id: number, label: string, parent?: string) {
    this.data = {
      id: id.toString(),
      og: this,
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
    og: Edge;
    source: string;
    target: string;
    label: string;
  };

  constructor (id: number, source: number, target: number, label: string) {
    this.data = {
      id: id.toString(),
      og: this,
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
    og: PersonNode;
  };

  constructor (person: Person, parentNode?: any, center?: boolean) {
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
      label: this.firstname + ' ' + this.lastname + (this.birthdate ? `\n*${this.birthdate.getFullYear()}` : ''),
      image: this.pic.src(),
      type: 'person',
      ...(parentNode ? {parent: parentNode.data.id,} : {}),
      ...(center ? {centerNode: true,} : {}),
      og: this,
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
    og: RelationEdge;
  };

  constructor (relation: Relation, person: Person) {
    if (relation.from) {
      super(
        relation.id,
        relation.type,
        relation.from,
        relation.other,
        relation.since,
        relation.until,
      );
    } else {
      super(
        relation.id,
        relation.type,
        relation.other,
        relation.since,
        relation.until,
      );
    }
    this.data = {
      id: `r-${this.id}-${person.id}-${this.other.id}`,
      label: RelationType[this.type].toLowerCase() 
             + (this.since ? `\n${this.since.getFullYear()} - ` : '')
             + (this.until ? `${this.since ? '' : '\n - '}${this.until.getFullYear()}` : ''),
      ...(this.type === RelationType.CHILD
        ? { source: this.other.id.toString(), target: person.id.toString() }
        : { source: person.id.toString(), target: this.other.id.toString() }
      ),
      color: COLORS[this.type],
      type: 'relation',
      og: this,
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
    og: OrganizationNode;
  };

  constructor (organization: Organization, parentNode?: any, center?: boolean) {
    super(
      organization.id,
      organization.bio,
      organization.name,
      organization.established,
      organization.dissolved,
    );
    this.data = {
      id: this.id.toString(),
      label: this.name + (this.established ? `\n*${this.established.getFullYear()}` : ''),
      image: this.pic.src(),
      type: 'organization',
      ...(parentNode ? {parent: parentNode.data.id,} : {}),
      ...(center ? {centerNode: true,} : {}),
      og: this,
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
    og: MembershipEdge;
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
      label: this.role.name 
             + (this.since ? `\n${this.since.getFullYear()} - ` : '')
             + (this.until ? `${this.since ? '' : '\n - '}${this.until.getFullYear()}` : ''),
      source: this.organ.id.toString(),
      target: this.organization.id.toString(),
      color: 'rgba(84, 84, 84, 0.48)',
      type: 'membership',
      og: this,
    };
  }
}

/**
 * Group memberships into compound nodes.
 */
export const groupMemberships = (memberships: Membership[], ignore?: (PersonNode|OrganizationNode)[]) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, [Role, Membership[]]>();
  memberships.forEach((m) => {
    if (!grouped.has(m.role.id)) grouped.set(m.role.id, [m.role, []]);
    grouped.get(m.role.id)![1].push(m);
  });
  for (const [role, ms] of grouped) {
    if (ms[1].filter(m => !ignore || !ignore.some(i => i.id === m.organization.id)).length > 1) {
      const group = { 
        data: {
          id: `${ms[1][0].organ.id}-${ms[0].name.toString()}`,
          label: ms[0].name.toString(),
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
        },
      };
      nodes.push(group);
      ms[1].forEach((m) => {
        if (ignore && ignore.some((i) => i.id === m.organization.id)) {
          edges.push(new MembershipEdge(m));
          return;
        };
        nodes.push(new OrganizationNode(m.organization, group));
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
      ms[1].forEach(m => {
        const membership = new MembershipEdge(m);
        if (!ignore || !ignore.some((i) => i.id === m.organization.id)) {
          nodes.push(new OrganizationNode(m.organization));
        }
        edges.push(membership);
      });
    }
  }
  return [nodes, edges];
};

/**
 * Group members into compound nodes.
 */
export const groupMembers = (members: Membership[], ignore?: (PersonNode|OrganizationNode)[]) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, [Role, Membership[]]>();
  members.forEach((m) => {
    if (!grouped.has(m.role.id)) grouped.set(m.role.id, [m.role, []]);
    grouped.get(m.role.id)![1].push(m);
  });
  for (const [role, ms] of grouped) {
    if (ms[1].filter(m => !ignore || !ignore.some(i => i.id === m.organ.id)).length > 1) {
      const group = { 
        data: {
          id: `${ms[1][0].organization.id}-${ms[0].name.toString()}`,
          label: ms[0].name.toString(),
          color: getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
        },
      };
      nodes.push(group);
      ms[1].forEach((m) => {
        if (ignore && ignore.some((i) => i.id === m.organ.id)) {
          edges.push(new MembershipEdge(m));
          return;
        }
        nodes.push(m.organ instanceof Person 
                   ? new PersonNode(m.organ, group) 
                   : new OrganizationNode(m.organ as Organization, group));
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
      ms[1].forEach((m) => {
        const membership = new MembershipEdge(m);
        if (!ignore || !ignore.some((i) => i.id === m.organ.id)) {
          nodes.push(m.organ instanceof Person 
                    ? new PersonNode(m.organ as Person) 
                    : new OrganizationNode(m.organ as Organization));
        }
        edges.push(membership);
      });
    }
  }
  return [nodes, edges];
};

export const groupRelations = (relations: Relation[], person: Person, ignore?: (PersonNode|OrganizationNode)[]) => {
  const nodes: (any)[] = [];
  const edges: (any)[] = [];
  const grouped = new Map<number, Relation[]>();
  relations.forEach((r) => {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  });
  for (const [type, rs] of grouped) {
    if (rs.filter(r => !ignore || !ignore.some(i => i.id === r.other.id)).length > 1) {
      const group = { 
        data: {
          id: `${person.id}-${RelationType[type].toLowerCase()}`,
          label: RelationType[type].toLowerCase(),
          color: COLORS[type as RelationType],
        },
      };
      nodes.push(group);
      rs.forEach((r) => {
        if (ignore && ignore.some((i) => i.id === r.other.id)) {
          edges.push(new RelationEdge(r, person));
          return;
        }
        nodes.push(new PersonNode(r.other, group));
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
      rs.forEach(r => {
        const relation = new RelationEdge(r, person);
        if (!ignore || !ignore.some((i) => i.id === r.other.id)) {
          nodes.push(new PersonNode(r.other));
        }
        edges.push(relation);
      });
    }
  }
  return [nodes, edges];
};

export const graphOptions: () => cytoscape.CytoscapeOptions = () => ({
  wheelSensitivity: .1,
  style: [
    {
      selector: 'node[type]',
      style: {
        'content': 'data(label)',
        'text-wrap': 'wrap',
        'line-height': 1.1,
        'color': getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        'background-image': 'data(image)',
        'background-repeat': 'no-repeat',
        'background-fit': 'cover',
        'background-color': getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        'border-color': getComputedStyle(document.documentElement).getPropertyValue('--color-border'),
        'border-width': '1.5px',
        'font-size': '.6em',
        'text-valign': 'bottom',
        'text-margin-y': 5,
      },
    },
    {
      selector: 'node[centerNode]',
      style: {
        'border-width': '3px',
        'width': 50,
        'height': 50,
      },
    },
    {
      selector: 'node:parent',
      css: {
        'content': 'data(label)',
        'text-wrap': 'wrap',
        'color': getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        'font-size': '.8em',
        'background-opacity': 0.2,
        'background-color': 'data(color)',
        'border-color': 'data(color)',
        'shape': 'roundrectangle'
      },
    },
    {
      selector: 'node.highlight',
      style: {
      },
    },
    {
      selector: 'node.semitransp',
      style: {
        opacity: .5,
      },
    },
    {
      selector: 'edge',
      style: {
        'color': getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
        'width': '1.5px',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'font-size': '.6em',
      },
    },
    {
      selector: 'edge[label]',
      style: {
        'content': 'data(label)',
        'text-wrap': 'wrap',
        'text-rotation': 'autorotate',
        'line-height': 1.1,
      },
    },
    {
      selector: 'edge.highlight',
      style: {
      },
    },
    {
      selector: 'edge.semitransp',
      style: {
        'opacity': .2,
      },
    },
  ],
});
