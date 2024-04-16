import React, { useEffect, useState } from 'react'
import Slider from '../components/Slider'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import Spinner from '../components/Spinner';
import { getAuth } from "firebase/auth";


export default function Home() {

  const [loading,setLoading]=useState(true)

  // Places for offer
  const [offerListings, setOfferListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "listings");
        // create the query
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setOfferListings(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);

  // Places for rent
  const [rentListings, setRentListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "listings");
        // create the query
        const q = query(
          listingsRef,
          where("type", "==", "rent"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setRentListings(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);

  // Places for sale
  const [saleListings, setSaleListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "listings");
        // create the query
        const q = query(
          listingsRef,
          where("type", "==", "sale"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setSaleListings(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
    setLoading(false)
  }, []);


  //for recommendations
  const [recommendedListings, setRecommendedListings] = useState(null);
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const auth = getAuth(); // Get the authentication object
        const user = auth.currentUser; // Get the current user

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's interests from their profile (you need to implement this part)
        const userInterests = user.metadata.interests || [];

        // Construct a Firestore query based on user's interests
        const listingsRef = collection(db, "listings");
        let q = query(listingsRef);

        // Create a map to store interest types and their corresponding values
        const interestMap = new Map();
        userInterests.forEach(interest => {
          const [interestType, interestValue] = interest.split('=');
          interestMap.set(interestType, interestValue);
        });

        // Filter listings based on user interests
        const filters = Array.from(interestMap.entries()).map(([interestType, interestValue]) => (
          where("typeOfEvent", "array-contains", interestType)
        ));

        // Add filters to the query
        if (filters.length > 0) {
          q = query(q, ...filters);
        }

        // Execute the query
        const querySnap = await getDocs(q);
        const listings = [];

        // Iterate over the query snapshot
        querySnap.forEach(doc => {
          if (listings.length >= 4) {
            return; // Break out of the loop if we have collected four listings
          }

          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        // Sort the listings based on relevance to user interests
        listings.sort((a, b) => {
          const relevanceA = a.data.typeOfEvent.filter(interest => interestMap.has(interest)).length;
          const relevanceB = b.data.typeOfEvent.filter(interest => interestMap.has(interest)).length;
          return relevanceB - relevanceA;
        });

        // Set the recommended listings state variable
        setRecommendedListings(listings);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);



  if(loading)
    return <Spinner/>

  return (
    <div>
      
      <Slider />

      <div className="max-w-6xl mx-auto pt-4 space-y-6">

        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 flex text-2xl mt-6 mb-1  font-semibold">
              Recent <h2 className="ml-2 font-bold"> Events</h2>
            </h2>
            <Link to="/offers">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more Events
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Recommended section */}
        {recommendedListings && recommendedListings.length > 0 && (
        <div className="m-2 mb-6">
          <h2 className="px-3 flex text-2xl mt-6 mb-1  font-semibold">
            Recommended <h2 className="ml-2 font-bold"> Events</h2>
          </h2>
          <Link to="/recommendations">
            <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
              Show more Recommendations
            </p>
          </Link>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {loading ? (
              <Spinner />
            ) : recommendedListings && recommendedListings.length > 0 ? (
              recommendedListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))
            ) : (
              <p className=''>No recommendations found. Showing most recent listings.</p>
            )}
          </ul>
        </div>
        )}
        

        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl flex mb-1 mt-6 font-semibold">
              Places for <h2 className="ml-2 font-bold">Contest</h2>
            </h2>
            <Link to="/category/rent">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more Contests
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 mb-1 flex font-semibold">
              Places for <h2 className="font-bold ml-2"> Webinar</h2>
            </h2>
            <Link to="/category/sale">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more Webinars
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
