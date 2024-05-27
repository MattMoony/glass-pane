import Person from './Person';
import RelationType from './RelationTypes';

/**
 * Represents the relation with another person.
 */
class Relation {
  /**
   * The unique identifier of the relation.
   */
  public id: number;
  /**
   * The type of the relation.
   */
  public type: RelationType;
  /**
   * The person who is in the relation.
   */
  public from?: Person;
  /**
   * The other person in the relation.
   */
  public other: Person;
  /**
   * The date the relation started.
   */
  public since?: Date|null;
  /**
   * The date the relation ended.
   */
  public until?: Date|null;

  public constructor (type: RelationType, other: Person, since?: Date|null, until?: Date|null);
  public constructor (id: number, type: RelationType, other: Person, since?: Date|null, until?: Date|null);
  public constructor (id: number, type: RelationType, from: Person, other: Person, since?: Date|null, until?: Date|null);
  public constructor (id: number|RelationType, type: RelationType|Person, other?: Person|Date|null, since?: Person|Date|null, until?: Date|null, last?: Date|null) {
    if (typeof id === 'number' && (since instanceof Date || typeof since === 'undefined')) {
      this.id = id;
      this.type = type as RelationType;
      this.other = other as Person;
      this.since = since;
      this.until = until;
    } 
    else if (typeof id !== 'number') {
      this.id = -1;
      this.type = id as RelationType;
      this.other = type as Person;
      this.since = other as Date;
      this.until = since as Date;
    }
    else {
      this.id = id;
      this.type = type as RelationType;
      this.from = other as Person;
      this.other = since as Person;
      this.since = until as Date;
      this.until = last;
    }
  }
}

export default Relation;
