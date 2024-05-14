import Moment from "react-moment";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";

import { db } from "../firebase";
import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function ListingItem({ listing, id, onEdit, onDelete }) {
    const [optionsVisible, setOptionsVisible] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;
    


    useEffect(() => {
        const fetchLikedStatus = async () => {
            const auth = getAuth(); // Get the authentication object
            const user = auth.currentUser; // Get the current user

            if (user) {
                const userDataRef = doc(db, "users", user.uid);
                const userDataSnap = await getDoc(userDataRef);
                const userData = userDataSnap.data();

                
                const likedListings = userDataSnap.data()?.liked || [];
                const lovedListings = userData?.loved || {};
                const dislikedListings = userData?.disliked || {};

                if (likedListings.includes(id))
                    setIcon({ component: <BiSolidLike /> })
                else if (lovedListings[id])
                    setIcon({ component: <GoHeartFill /> });
                else if (dislikedListings[id])
                    setIcon({ component: <BiSolidDislike /> });
                else
                    setIcon({ component: <GoHeart/> });
            }
        };
        fetchLikedStatus();
    }, [id]);

    const onClickLike = async () => {

        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const likedListings = userData?.liked || [];

            // Toggle like status
            if (likedListings.includes(id)) {
                // Remove listing from likedListings
                const updatedLikedListings = likedListings.filter((listingId) => listingId !== id);
                await updateDoc(userDataRef, { liked: updatedLikedListings });

                setIcon({component:<GoHeart />}); // Set default icon
            } else {
                // Add listing to likedListings
                const updatedLikedListings = [...likedListings, id];
                await updateDoc(userDataRef, { liked: updatedLikedListings });

                setIcon({component:<BiSolidLike />}); // Set like icon
            }

            deleteFromDisikedList();
            deleteFromLovedList();

        }
    };

    const [icon, setIcon] = useState({ component: <GoHeart />}); 


    const onClickLove = async () => {

        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const lovedListings = userData?.loved || {};

            // Toggle love status
            if (lovedListings[id]) {
                // Remove listing from lovedListings
                delete lovedListings[id];
                setIcon({ component: <GoHeart />}); // Set default icon
            } else {
                // Add listing to lovedListings
                lovedListings[id] = listing.typeOfEvent || [];
                setIcon({ component: <GoHeartFill />});
            }

            deleteFromDisikedList();
            deleteFromLikedList();

            await updateDoc(userDataRef, { loved: lovedListings });
        }
    };

    const onClickDislike = async () => {
     
        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const dislikedListings = userData?.disliked || {};

            // Toggle dislike status
            if (dislikedListings[id]) {
                // Remove listing from dislikedListings
                delete dislikedListings[id];
                setIcon({ component: <GoHeart />}); // Set default icon

            } else {
                // Add listing to dislikedListings
                
                dislikedListings[id] = listing.typeOfEvent || [];
                setIcon({ component: <BiSolidDislike />}); // Set dislike icon
            }

            deleteFromLikedList();
            deleteFromLovedList();

            await updateDoc(userDataRef, { disliked: dislikedListings });
        }
    };

    
    const deleteFromLikedList = async () => {

        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const likedListings = userData?.liked || [];
            let updatedLikedListings=null;

            // Toggle like status
            if (likedListings.includes(id)) {
                // Remove listing from likedListings
                updatedLikedListings = likedListings.filter((listingId) => listingId !== id);
                await updateDoc(userDataRef, { liked: updatedLikedListings });
            }
        }
    };

    const deleteFromDisikedList = async () => {

        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const dislikedListings = userData?.disliked || {};

            // Toggle dislike status
            if (dislikedListings[id]) {
                // Remove listing from dislikedListings
                delete dislikedListings[id];
                await updateDoc(userDataRef, { disliked: dislikedListings });
            } 

        }
    };

    const deleteFromLovedList = async () => {
       
        if (user) {
            const userDataRef = doc(db, "users", user.uid);
            const userDataSnap = await getDoc(userDataRef);
            const userData = userDataSnap.data();

            const lovedListings = userData?.loved || {};

            // Toggle love status
            if (lovedListings[id]) {
                // Remove listing from lovedListings
                delete lovedListings[id];
                await updateDoc(userDataRef, { loved: lovedListings });
            } 

        }
    };



    const handleOptionsVisible = () => {
        setOptionsVisible(true);
    };

    const handleOptionsHide = () => {
        setOptionsVisible(false);
    };

    return (
        <li
            className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]"
            onMouseEnter={handleOptionsVisible}
            onMouseLeave={handleOptionsHide}
        >
            {optionsVisible && (
                <div className="absolute top-3 right-4 flex space-x-2">
                    <button
                        className="bg-[#9ccc33] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
                        onClick={onClickDislike}
                    >
                        Not for me
                    </button>
                    <button
                        className="bg-[#9ccc33] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
                        onClick={onClickLike}
                    >
                        I like this
                    </button>
                    <button
                        className="bg-[#9ccc33] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
                        onClick={onClickLove}
                    >
                        Love this
                    </button>
                </div>
            )}
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
                        {listing.regularPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                    <div className="flex items-center space-x-1">
                        <p className="font-semibold text-sm mb-[2px] pb-[20px] text-gray-600 truncate">
                            {listing.description}
                        </p>
                    </div>
                </div>
            </Link>
            {/* {!heart ? (
                <GoHeart
                    className="absolute top-3 right-4 h-[25px] text-4xl animate-bounce bg-red-200 rounded-full  border-2 cursor-pointer text-red-500 "
                    onClick={onClickLike}
                />
            ) : (
                <BiSolidLike
                    className="absolute top-3 right-4 h-[25px] text-4xl bg-red-200 rounded-full  border-2  cursor-pointer text-red-500"
                    onClick={onClickLike}
                />
            )} */}
            <div
                className="absolute top-3 right-4 h-[25px] text-4xl animate-bounce bg-red-200 rounded-full  border-2 cursor-pointer text-red-500 "
            >
                {icon.component}
            </div>

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
