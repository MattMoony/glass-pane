import Person from './Person';
import RelationType from './RelationTypes';

/**
 * Represents the relation with another person.
 */
class Relation {
  public type: RelationType;
  public other: Person;
  public since: Date;
  public until?: Date;

  public constructor (type: RelationType, other: Person, since: Date, until?: Date) {
    this.type = type;
    this.other = other;
    this.since = since;
    this.until = until;
  }
}

export default Relation;
