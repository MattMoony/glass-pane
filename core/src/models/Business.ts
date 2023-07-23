import Organization from './Organization';

/**
 * Represents a business.
 */
class Business extends Organization {
  public toString (): string {
    return `"${this.name}" (Business#${this.id})`;
  }
}

export default Business;
