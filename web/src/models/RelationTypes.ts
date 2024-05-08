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

/**
 * The colors of the different types of relationships.
 */
export const COLORS = {
  [RelationType.PARENT]: '#23FF2D',
  [RelationType.ROMANTIC]: '#FF3423',
  [RelationType.FRIEND]: '#FFD023',
  [RelationType.CHILD]: '#23FF2D',
};

export default RelationType;
