// db/ensureIndexes.js
import { Payment, Student } from '../models/index.js'

export const ensureIndexes = async () => {
  try {
    console.log('Ensuring indexes exist...')

    // Payment indexes
    await Payment.collection.createIndex({ studentId: 1 }, { background: true })
    await Payment.collection.createIndex(
      { accountNumber: 1 },
      { background: true }
    )
    await Student.collection.createIndex(
      { accountNumber: 1 },
      { background: true }
    )

    console.log('All indexes ensured successfully')
  } catch (error) {
    console.error('Error ensuring indexes:', error)
  }
}
