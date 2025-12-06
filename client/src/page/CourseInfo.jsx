import React from 'react'
import { useParams } from 'react-router-dom';

const CourseInfo = () => {
    const {id} = useParams();
    console.log(id);
  return (
    <div>CourseInfo</div>
  )
}

export default CourseInfo