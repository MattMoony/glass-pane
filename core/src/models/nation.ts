import Organization from './organization';

/**
 * Represents a political nation.
 */
class Nation extends Organization {
  public toString = (): string => {
    return `"${this.name}" (Nation#${this.id})`;
  };
}

export default Nation;
