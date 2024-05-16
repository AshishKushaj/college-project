import React, { useState, useEffect, Fragment } from "react";
import { FaBell } from 'react-icons/fa6';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Notification() {
    const auth = getAuth();
    const navigate = useNavigate();
    const db = getFirestore();
    const [notifications, setNotifications] = useState({ notify: {}, notified: {} });
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifyCount, setNotifyCount] = useState(0);


    const fetchAvailableListings = async () => {
        const listingsRef = collection(db, "listings");
        const listingsSnapshot = await getDocs(listingsRef);
        const listings = {};
        listingsSnapshot.forEach(doc => {
            listings[doc.id] = true;
        });
        return listings;
    };

    

    const fetchNotifications = async () => {
        setNotifyCount(0);
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();

                const notifyData = userData.notify || {};
                const notifiedData = userData.notified || {};

                const availableListings = await fetchAvailableListings();

                // Filter out notifications for deleted listings
                const validNotifyData = {};
                const validNotifiedData = {};

                for (const key in notifyData) {
                    if (availableListings[key]) {
                        validNotifyData[key] = notifyData[key];
                    }
                }

                for (const key in notifiedData) {
                    if (availableListings[key]) {
                        validNotifiedData[key] = notifiedData[key];
                    }
                }

                setNotifications({
                    notify: validNotifyData,
                    notified: validNotifiedData,
                });


                const mergedNotified = { ...validNotifyData, ...validNotifiedData };
                await updateDoc(userRef, { notified: mergedNotified, notify: {} });
            }
        }
    };

    const fetchNotifyCount = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();

                const availableListings = await fetchAvailableListings();
                let validNotifyCount = 0;

                for (const key in userData.notify) {
                    if (availableListings[key]) {
                        validNotifyCount++;
                    }
                }

                setNotifyCount(validNotifyCount);
            }
        }
    };


    useEffect(() => {
        fetchNotifyCount();
    });

    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    const handleBellClick = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <Menu as="div" className="relative m-2 inline-block text-left">
            <div className="relative">
                <Menu.Button onClick={handleBellClick} className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <FaBell />
                    {notifyCount > 0 && !showDropdown && (
                        <span className="absolute top-2 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {notifyCount}
                        </span>
                    )}
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <h4 className='text-sm font-medium px-4 py-2'>Notifications</h4>
                        {Object.entries(notifications.notify).length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-700">No news</div>
                        ) : (
                            Object.entries(notifications.notify).map(([id, data]) => (
                                <Menu.Item key={id}>
                                    {({ active }) => (
                                        <div
                                            onClick={() => navigate(`/category/${data.type}/${id}`)}
                                            className={classNames(
                                                active ? 'bg-gray-200 text-gray-900' : 'text-gray-700',
                                                'block px-4 py-2 text-sm cursor-pointer'
                                            )}
                                        >
                                            <div className="w-full p-[1px]">
                                                <p className="font-semibold m-0 text-lg truncate">{data.name}</p>
                                                <p className="text-[#457b9d] font-semibold">
                                                    Rs
                                                    {data.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                </p>
                                                <div className="flex items-center space-x-1">
                                                    <p className="font-semibold text-sm pb-[5px] text-gray-600 truncate">
                                                        {data.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        )}
                    </div>
                    <div className="py-1">
                        {Object.entries(notifications.notified).length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-700"></div>
                        ) : (
                            Object.entries(notifications.notified).map(([id, data]) => (
                                <Menu.Item key={id}>
                                    {({ active }) => (
                                        <div
                                            onClick={() => navigate(`/category/${data.type}/${id}`)}
                                            className={classNames(
                                                active ? 'bg-gray-200 text-gray-900' : 'text-gray-700',
                                                'block px-4 py-2 text-sm cursor-pointer '
                                            )}
                                        >
                                            <div className="w-full p-[1px]">
                                                <p className="font-semibold m-0 text-lg truncate">{data.name}</p>
                                                <p className="text-[#457b9d] font-semibold">
                                                    Rs
                                                    {data.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                </p>
                                                <div className="flex items-center space-x-1">
                                                    <p className="font-semibold text-sm pb-[5px] text-gray-600 truncate">
                                                        {data.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
