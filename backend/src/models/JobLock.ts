import { model, Schema } from "mongoose"

// Bloqueo entre procesos (backend en Render y cron en GitHub Actions) para que
// un mismo trabajo no corra dos veces a la vez. Ver utils/jobLock.
export interface IJobLock {
  _id: string;      // clave del trabajo, ej. "scrape:rudeboys"
  owner: string;    // id aleatorio de quien lo tomó; solo ese puede liberarlo
  lockedAt: Date;
  expiresAt: Date;  // pasada esta fecha otro proceso puede tomarlo (si el dueño murió)
}

const JobLockSchema = new Schema<IJobLock>({
  _id: { type: String, required: true },
  owner: { type: String, required: true },
  lockedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
}, {
  versionKey: false,
});

// Mongo borra solo los bloqueos vencidos (no es necesario para que funcione, solo limpia).
JobLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const JobLockModel = model<IJobLock>("JobLock", JobLockSchema);

export default JobLockModel
