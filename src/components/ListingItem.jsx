import Moment from "react-moment";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuth, updateCurrentUser, updateProfile } from "firebase/auth";


export default function ListingItem({ listing, id, onEdit, onDelete }) {

  const [heart, setHeart] = useState(false);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      const auth = getAuth(); // Get the authentication object
      const user = auth.currentUser; // Get the current user

      if (user) {
        const userDataRef = doc(db, "users", user.uid);
        const userDataSnap = await getDoc(userDataRef);
        const likedListings = userDataSnap.data()?.liked || [];
        setHeart(likedListings.includes(id));
      }
    };
    fetchLikedStatus();
  }, [id]);


  const onClickHeart = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDataRef = doc(db, "users", user.uid);
      const userDataSnap = await getDoc(userDataRef);
      const userData = userDataSnap.data();

      const likedListings = userData?.liked || [];
      const typeOfEvent = listing.typeOfEvent || [];

      // Toggle like status
      if (likedListings.includes(id)) {
        // Remove listing from likedListings
        const updatedLikedListings = likedListings.filter((listingId) => listingId !== id);
        await updateDoc(userDataRef, { liked: updatedLikedListings });

        // Remove each type of event from user's interest
        const updatedInterest = userData?.interest?.map((item) => {
          if (typeOfEvent.includes(item.value)) {
            if (item.count > 1) {
              // Decrease count if count is greater than 1
              return { value: item.value, count: item.count - 1 };
            } else {
              // Remove item if count is 1
              return null;
            }
          }
          return item;
        }).filter((item) => item !== null);

        await updateDoc(userDataRef, { interest: updatedInterest });
      } else {
        // Add listing to likedListings
        const updatedLikedListings = [...likedListings, id];
        await updateDoc(userDataRef, { liked: updatedLikedListings });

        // Add each type of event to user's interest
        const updatedInterest = userData?.interest || [];
        typeOfEvent.forEach((event) => {
          const existingItem = updatedInterest.find((item) => item.value === event);
          if (existingItem) {
            // Increment count if item already exists
            existingItem.count += 1;
          } else {
            // Add new item if item doesn't exist
            updatedInterest.push({ value: event, count: 1 });
          }
        });

        await updateDoc(userDataRef, { interest: updatedInterest });
      }

      setHeart((prevHeart) => !prevHeart);
    }
  };


  // const [formData, setFormData] = useState({
  //   name: auth.currentUser.displayName,
  //   email: auth.currentUser.email,
  // });
  

  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
      <Link className="contents" to={`/category/${listing.type}/${id}`}>
        <img
          alt=""
          className="h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in"
          loading="lazy"
          src={listing.imgUrls[0]}
        />
        <Moment
          className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
          fromNow
        >
          {listing.timestamp?.toDate()}
        </Moment>

        

        <div className="w-full p-[10px]">
          <div className="flex items-center space-x-1">
            <MdLocationOn className="h-4 w-4 text-green-600" />
            <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate">
              {listing.address}
            </p>
          </div>
          <p className="font-semibold m-0 text-xl truncate">{listing.name}</p>
          <p className="text-[#457b9d] mt-2 font-semibold">
            Rs 
            {
            // listing.offer
            //   ? listing.discountedPrice
            //       .toString()
            //       .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            //   : 
              listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {/* {listing.type === "rent" && " / month"} */}
          </p>

          <div className="flex items-center space-x-1">
            <p className="font-semibold text-sm mb-[2px] pb-[20px] text-gray-600 truncate">
              {listing.description}
            </p>
          </div>
          {/* <div className="flex items-center mt-[10px] space-x-3">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}

              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Baths`
                  : "1 Bath"}
              </p>
            </div>
          </div> */}
        </div>
      </Link>

      {!heart ?
        <GoHeart
          className='absolute top-3 right-4 h-[25px] text-4xl animate-bounce bg-red-200 rounded-full  border-2 cursor-pointer text-red-500 '
          onClick={onClickHeart}
        />
        : <GoHeartFill
          className='absolute top-3 right-4 h-[25px] text-4xl bg-red-200 rounded-full  border-2  cursor-pointer text-red-500'
          onClick={onClickHeart}
      />}


      {onDelete && (
        <TbTrashXFilled
          className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500"
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <FaEdit
          className="absolute bottom-2 right-7 h-4 cursor-pointer "
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
}
