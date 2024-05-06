/**
 * The possible types of relationships between two natural persons
 * currently representable in the DB.
 */
enum RelationType {
  PARENT = 1,
  ROMANTIC,
  FRIEND,
  CHILD,
}

export default RelationType;
