import Person from './Person';
import RelationType from './RelationTypes';

/**
 * Represents the relation with another person.
 */
class Relation {
  /**
   * The type of the relation.
   */
  public type: RelationType;
  /**
   * The other person in the relation.
   */
  public other: Person;
  /**
   * The date the relation started.
   */
  public since: Date;
  /**
   * The date the relation ended.
   */
  public until?: Date;

  public constructor (type: RelationType, other: Person, since: Date, until?: Date) {
    this.type = type;
    this.other = other;
    this.since = since;
    this.until = until;
  }
}

export default Relation;
