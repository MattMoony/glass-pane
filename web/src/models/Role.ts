import * as role from '@/api/role';

class Role implements role.Role {
  public id: number;
  public name: string;

  public constructor (id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public json (): role.Role {
    return {
      id: this.id,
      name: this.name,
    };
  }

  public toString (): string {
    return `"${this.name}" (Role#${this.id})`;
  }

  public static async create (name: string): Promise<Role|null> {
    const res = await role.create(name);
    return res.role ? new Role(res.role.id, res.role.name) : null;
  }

  public static async search (name: string): Promise<Role[]> {
    const res = await role.search(name);
    return res.roles.map(r => new Role(r.id, r.name));
  }

  public static async get (id: number): Promise<Role|null> {
    const res = await role.get(id);
    return res.role ? new Role(res.role.id, res.role.name) : null;
  }

  public async update (): Promise<void> {
    const res = await role.update(this.id, this.name);
    this.name = res.role?.name ?? this.name;
  }

  public async remove (): Promise<void> {
    await role.remove(this.id);
  }
}

export default Role;
