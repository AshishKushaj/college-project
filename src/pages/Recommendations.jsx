import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where   } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { getAuth } from "firebase/auth";



export default function Recommendations() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    if (listings.length >= 10) {
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
                setListings(listings);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-3">
            <h1 className="text-3xl text-center mt-6 font-bold mb-6">Recommended Events</h1>
            {loading ? (
                <Spinner />
            ) : listings.length > 0 ? (
                <main>
                    <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {listings.map((listing) => (
                            <ListingItem
                                key={listing.id}
                                id={listing.id}
                                listing={listing.data}
                            />
                        ))}
                    </ul>
                </main>
            ) : (
                <p>No recommendations found based on your interests.</p>
            )}
        </div>
    );
}
