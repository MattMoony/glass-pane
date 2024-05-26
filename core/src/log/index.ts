import winston from 'winston';

export const baseLogger = (label: string) => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.label({ label, }),
      winston.format.padLevels(),
      winston.format.colorize(),
      winston.format.printf(info => `[${info.level}:${info.label}]:\t${info.message}`),
    ),
    defaultMeta: { service: 'core' },
    transports: [
      new winston.transports.Console(),
    ],
  });
};
