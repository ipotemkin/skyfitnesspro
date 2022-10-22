import { Button } from '@mui/material'
import { FC } from 'react'

import { CourseData } from '../../types'

import styles from './style.module.css'

type Props = { item: CourseData }

export const CourseLine: FC<Props> = ({ item }) => {
  const handleAddCourse = () => {
    console.log('adding course:', item.id)
  }

  const handleRemoveCourse = () => {
    console.log('removing course:', item.id)
  }
  
  return (
    <div className={styles.line} style={{ backgroundColor: (item.id! % 2 === 0 ? 'whitesmoke' : '')}}
    >
      <div className={styles.col1}>{item.id}</div>
      <div className={styles.col2}>{item.name}</div>
      <div className={styles.col3}>
        {item.subscription && <Button style={{ color: 'red' }} onClick={handleRemoveCourse}>Удалить</Button>}
        {!item.subscription && <Button onClick={handleAddCourse}>Добавить</Button>}
      </div>
    </div>
  )
}
