/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createType('parish_relation', [
        'attach',
        'visit',
        'ancestor_attached',
    ]);

    pgm.createTable('user_parishes', {
        id: 'id', // Shorthand for serial primary key
        user_id: { type: 'varchar(255)', notNull: true },
        parish_id: { type: 'uuid', notNull: true },
        type: { type: 'parish_relation',  notNull: true, default: 'visit' },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.addConstraint('user_parishes', 'user_parishes_parish_user_unique', {
        unique: ['parish_id', 'user_id'],
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('user_parishes');
    pgm.dropType('parish_relation');
    pgm.dropConstraint('user_parishes', 'user_parishes_parish_user_unique');
};
