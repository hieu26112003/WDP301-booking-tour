import React from 'react'
import ServiceCard from './ServiceCard'
import { Col } from 'reactstrap'
import weatherImg from '../assets/images/weather.png'
import guideImg from '../assets/images/guide.png'
import customizationImg from '../assets/images/customization.png'

const servicesData = [
   {
      imgUrl: weatherImg,
      title: `Calculate Weather`,
      desc: `Stay ahead of the forecast with our cutting-edge weather calculations. From sunny skies to stormy conditions, our accurate predictions ensure you're always prepared for your next adventure. Say goodbye to unexpected weather surprises and hello to worry-free travels.`,
   },
   {
      imgUrl: guideImg,
      title: `Best Tour Guide`,
      desc: `Explore with confidence alongside our seasoned tour guides. With a wealth of knowledge and a passion, our guides transform every destination into an unforgettable experience. Discover hidden treasures and iconic landmarks, ensuring each moment is unforgettable.`,
   },
   {
      imgUrl: customizationImg,
      title: 'Customization',
      desc: `Craft your ideal adventure with our tailored experiences. Whether seeking thrills or tranquility, our customizable packages cater to your preferences. From curated itineraries to handpicked accommodations, create memories that reflect your unique travel style.`,
   },
]

const ServiceList = () => {
   return <>
      {
         servicesData.map((item, index) => (
            <Col lg='3' md='6' sm='12' className='mb-4' key={index}>
               <ServiceCard item={item} />
            </Col>))
      }
   </>

}

export default ServiceList