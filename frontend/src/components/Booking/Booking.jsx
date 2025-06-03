import React, { useState, useContext, useEffect } from 'react';
import './booking.css';
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/config';
import axios from 'axios';

const Booking = ({ tour, avgRating }) => {
   const { price, reviews, title } = tour;
   const [itinerary, setItinerary] = useState([]);
   const [hotels, setHotels] = useState([]);
   const [restaurants, setRestaurants] = useState([]);
   const tourId = tour._id;
   const navigate = useNavigate();
   const { user } = useContext(AuthContext);

   const [booking, setBooking] = useState({
      userId: user && user._id,
      userEmail: user && user.email,
      tourName: title,
      fullName: '',
      phone: '',
      guestSize: 1,
      bookAt: '',
      status: 'pending',
      price: price,
      hotelId: '',
      hotelPrice: 0, // thêm trường hotelPrice
      restaurantId: ''
   });

   const [errors, setErrors] = useState({
      guestSize: '',
      bookAt: '',
   });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const itineraryResponse = await axios.get(`${BASE_URL}/itinerary/tour/${tourId}`, {
               withCredentials: true,
            });
            const hotelResponse = await axios.get(`${BASE_URL}/hotels/tour/${tourId}`, {
               withCredentials: true,
            });
            const restaurantResponse = await axios.get(`${BASE_URL}/restaurants/tour/${tourId}`, {
               withCredentials: true,
            });
            setItinerary(itineraryResponse.data);
            setHotels(hotelResponse.data);
            setRestaurants(restaurantResponse.data);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchData();
   }, [tourId]);

   const handleChange = e => {
      const { id, value } = e.target;

      setBooking(prev => ({ ...prev, [id]: value }));

      // Validate input fields and set errors
      if (id === 'guestSize') {
         if (value < 1) {
            setErrors(prev => ({ ...prev, guestSize: 'Guest size must be at least 1.' }));
         } else {
            setErrors(prev => ({ ...prev, guestSize: '' }));
         }
      }

      if (id === 'bookAt') {
         const bookingDate = new Date(value);
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         if (bookingDate < today) {
            setErrors(prev => ({ ...prev, bookAt: 'Booking date cannot be in the past.' }));
         } else {
            setErrors(prev => ({ ...prev, bookAt: '' }));
         }
      }
      console.log(booking);
   }

   const handleSelectChange = e => {
      const { name, value } = e.target;

      if (name === 'hotelId') {
         const selectedHotel = hotels.find(hotel => hotel._id === value);
         setBooking(prev => ({ ...prev, hotelId: value, hotelPrice: selectedHotel ? selectedHotel.price : 0 }));
      } else if (name === 'restaurantId') {
         setBooking(prev => ({ ...prev, restaurantId: value }));
      }
      console.log(booking);
   }

   const serviceFee = 10;
   const totalAmount = Number(price) * Number(booking.guestSize)
      + Number(serviceFee)
      + Number(booking.hotelPrice) * Number(booking.guestSize);

   const handleClick = async e => {
      e.preventDefault();

      // Validate guest size
      if (booking.guestSize < 1) {
         return alert('Guest size must be at least 1.');
      }

      // Validate booking date
      if (!booking.bookAt) {
         return alert('Please select a booking date.');
      }

      // Convert booking date to a Date object for comparison
      const bookingDate = new Date(booking.bookAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set current time to midnight for accurate comparison

      if (bookingDate < today) {
         return alert('Booking date cannot be in the past.');
      }

      try {
         if (!user || user === undefined || user === null) {
            return alert('Please sign in');
         }

         const res = await fetch(`${BASE_URL}/booking`, {
            method: 'post',
            headers: {
               'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ ...booking, price: totalAmount })
         });

         const result = await res.json();

         if (!res.ok) {
            return alert(result.message);
         }
         navigate('/thank-you');
      } catch (error) {
         alert(error.message);
      }
   }

   return (
      <div className='booking'>
         <div className="booking__top d-flex align-items-center justify-content-between">
            <h3>${price} <span>/per person</span></h3>
            <span className="tour__rating d-flex align-items-center">
               <i className='ri-star-fill' style={{ 'color': 'var(--secondary-color)' }}></i>
               {avgRating === 0 ? null : avgRating} ({reviews?.length})
            </span>
         </div>

         {/* =============== BOOKING FORM START ============== */}
         <div className="booking__form">
            <h5>Information</h5>
            <Form className='booking__info-form' onSubmit={handleClick}>
               <FormGroup>
                  <input type="text" placeholder='Full Name' id='fullName' required onChange={handleChange} />
               </FormGroup>
               <FormGroup>
                  <input type="tel" placeholder='Phone' id='phone' required onChange={handleChange} />
               </FormGroup>
               <FormGroup className='d-flex align-items-center gap-3'>
                  <input type="date" placeholder='' id='bookAt' required onChange={handleChange} />
                  <input type="number" placeholder='Guest' id='guestSize' required onChange={handleChange} />
               </FormGroup>
               <p className='text-danger'> {errors.bookAt && <small>{errors.bookAt}</small>}</p>
               <p className='text-danger'>{errors.guestSize && <small >{errors.guestSize}</small>}</p>
               <FormGroup>
                  <label htmlFor="hotel">Select Hotel:</label>
                  <select name="hotelId" id="hotelId" onChange={handleSelectChange} required>
                     <option value="">Select a hotel</option>
                     {hotels.map(hotel => (
                        <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                     ))}
                  </select>
               </FormGroup>
               <FormGroup>
                  <label htmlFor="restaurant">Select Restaurant:</label>
                  <select name="restaurantId" id="restaurantId" onChange={handleSelectChange} required>
                     <option value="">Select a restaurant</option>
                     {restaurants.map(restaurant => (
                        <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                     ))}
                  </select>
               </FormGroup>
            </Form>
         </div>
         {/* =============== BOOKING FORM END ================ */}

         {/* =============== ITINERARY START ================ */}
         <div className="itinerary">
            <h5>Itinerary</h5>
            {itinerary.map((day, index) => (
               <div key={index} className="itinerary__day">
                  <h6>Day {day.day}</h6>
                  <ul>
                     {day.detail.split(', ').map((activity, idx) => (
                        <li key={idx}>{activity}</li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
         {/* =============== ITINERARY END ================ */}

         {/* =============== BOOKING BOTTOM ================ */}
         <div className="booking__bottom">
            <ListGroup>
               <ListGroupItem className='border-0 px-0'>
                  <h5 className='d-flex align-items-center gap-1'>${price} <i className='ri-close-line'></i> {booking.guestSize} person(s)</h5>
                  <span> ${price * booking.guestSize}</span>
               </ListGroupItem>
               <ListGroupItem className='border-0 px-0'>
                  <h5 className='d-flex align-items-center gap-1'>Hotel Price: {booking.hotelPrice} <i className='ri-close-line'></i> {booking.guestSize} person(s)</h5>
                  <span> ${booking.hotelPrice * booking.guestSize}</span>
               </ListGroupItem>
               <ListGroupItem className='border-0 px-0'>
                  <h5>Service charge</h5>
                  <span>${serviceFee}</span>
               </ListGroupItem>
               <ListGroupItem className='border-0 px-0 total'>
                  <h5>Total</h5>
                  <span>${totalAmount}</span>
               </ListGroupItem>
            </ListGroup>

            <Button className='btn primary__btn w-100 mt-4' onClick={handleClick}>Book Now</Button>
         </div>
      </div>
   );
}

export default Booking;
