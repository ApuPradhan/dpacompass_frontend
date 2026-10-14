// dashboard_/hooks/useDashboard.js

import { useEffect, useState } from "react";

import dashboardService from "../services/dashboardService";

import {
    transformDashboard
} from "../transformers/dashboardTransformer";


export default function useDashboard(role) {

    const cached =
        dashboardService.getLatestData();


    const [dashboard, setDashboard] =
        useState(
            cached
                ? transformDashboard(
                    cached,
                    role
                )
                : {
                    widgets: [],
                }
        );


    const [loading, setLoading] =
        useState(!cached);


    const [connected, setConnected] =
        useState(
            dashboardService.isConnected()
        );


    useEffect(() => {

        const handleDashboardUpdate =
            (rawData) => {

                // console.log(
                //     "Dashboard WebSocket update:",
                //     rawData
                // );

                // console.log(
                //     "Dashboard role:",
                //     rawData?.role
                // );

                // console.log(
                //     "Dashboard summary:",
                //     rawData?.summary
                // );


                /*
                 * Ignore data intended for
                 * another role.
                 */
                if (
                    rawData?.role &&
                    rawData.role !== role
                ) {
                    return;
                }


                const transformed =
                    transformDashboard(
                        rawData,
                        role
                    );


                setDashboard(
                    transformed
                );


                setLoading(false);

                setConnected(true);

            };


        /*
         * Subscribe FIRST
         */
        dashboardService.subscribe(
            handleDashboardUpdate
        );


        /*
         * Then connect
         */
        dashboardService.connect();


        setConnected(
            dashboardService.isConnected()
        );


        return () => {

            dashboardService.unsubscribe(
                handleDashboardUpdate
            );

        };

    }, [role]);


    return {

        loading,

        connected,

        dashboard,

    };

}