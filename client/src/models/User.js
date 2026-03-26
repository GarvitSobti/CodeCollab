class User {
  constructor({
    id = '',
    name = '',
    email = '',
    initials,
    uni = '',
    skills = [],
    ...attributes
  } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.initials = initials || User.getInitials(name || email);
    this.uni = uni;
    this.skills = Array.isArray(skills) ? skills : [];

    Object.assign(this, attributes);
  }

  static getInitials(source = '') {
    if (!source) {
      return '';
    }

    const parts = source
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return '';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}

export default User;
