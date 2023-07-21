/**
 * Represents a currency.
 */
class Currency {
  public id: number;
  public name: string;
  public symbol: string;

  public constructor (id: number, name: string, symbol: string) {
    this.id = id;
    this.name = name;
    this.symbol = symbol;
  }

  public json = (): Object => ({
    id: this.id,
    name: this.name,
    symbol: this.symbol,
  });

  public toString = (): string => {
    return `${this.symbol} (${this.name})`;
  };
}

export default Currency;