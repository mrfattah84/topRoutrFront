import { apiSlice } from "../../../api";

export interface Fleet {
  id: string;
  driver_user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
  };
  owner: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
  };
  vehicle: {
    id: string;
    uuid: string;
    file: null;
    vehicle_type_detail: {
      uuid: string;
      id: string;
      owner: null;
      code: string;
      name: string;
      description: string;
      is_active: boolean;
    };
    driver_id: string;
    owner: string;
    vehicle_type: string;
    has_custom_features: boolean;
    license_plate: string;
    name: string;
    minVisitNumber: number;
    maxVisitNumber: number;
    label: null;
    is_active: boolean;
    serial_number: null;
    work_hours: null;
    break_duration: null;
    time_window: null;
    has_custom_capacities: boolean;
    weight: null;
    minCapacity: null;
    maxCapacity: 230;
    length: 2;
    height: 3;
    width: 10;
    volume: null;
    email: null;
    limit_number_of_orders: null;
    created_at: string;
    updated_at: string;
  };
  service_area: null;
  cost: {
    uuid: string;
    id: string;
    owner: string;
    fixed_cost: number;
    per_km_cost: number;
    per_hour_cost: number;
    per_hour_overtime_cost: number;
    worktime: null;
    limit_route_distance: boolean;
    distance_limit: null;
  };
  work_schedule: {
    uuid: string;
    id: string;
    name: string;
    owner: string;
    calendar_mode: string;
    timezone: string;
    allow_weekly_off: boolean;
    start_time_1: string;
    end_time_1: string;
    break_minutes_1: number;
    start_time_2: null;
    end_time_2: null;
    break_minutes_2: number;
    created_at: string;
    updated_at: string;
  };
  geojson?: {
    type: string;
    driver_id: string;
    location: {
      latitude: number;
      longitude: number;
      coordinates: [number, number];
    };
    recorded_at: string;
    received_at: string;
    speed: number;
    heading: number;
    accuracy: number;
    source: string;
    timestamp: string;
  };
  start_location: null;
  end_location: null;
  serialNumber: string;
  externalId: string;
  name: null;
  cell_phone: null;
  staff_number: null;
  license_number: null;
  license_expiration_date: null;
  use_depot_as_start: boolean;
  use_last_order_as_end: boolean;
  end_route: boolean;
  orders: [];
  key: string;
}

export const fleetTableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFleets: builder.query<Fleet[], void>({
      providesTags: ["Fleet"],
      query: () => ({
        url: "/drivers/",
      }),
      transformResponse: (data: Fleet[]) => {
        data.map((fleet) => {
          fleet.key = fleet.id;
        });
        return data;
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Establish a WebSocket connection
        const socket = new WebSocket(
          "ws://172.16.5.12:8008/api/ws/driver-location/?token=" +
            localStorage.getItem("token")
        );
        try {
          socket.onopen = async () => {
            await cacheDataLoaded;
            socket.addEventListener("message", (event) => {
              const data = JSON.parse(event.data);
              if (data.type === "location_change") {
                updateCachedData((draft) => {
                  const index = draft.findIndex((d) => d.id === data.driver_id);
                  if (index !== -1) {
                    draft[index].geojson = data;
                  } else {
                    console.warn(
                      `Driver with ID ${data.driver_id} not found in cache.`
                    );
                  }
                });
              }
            });
            await cacheEntryRemoved;
          };
        } catch {
          console.log("err with socket");
        }
      },
    }),
    changeFleetActive: builder.mutation({
      invalidatesTags: ["Fleet"],
      query: ({ id, activated }) => ({
        url: `drivers/${id}/`,
        method: "PATCH",
        body: { activated },
      }),
      async onQueryStarted({ id, activated }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          fleetTableApi.util.updateQueryData(
            "getFleets",
            undefined,
            (draft) => {
              const fleet = draft.find((fleet) => fleet.id === id);
              if (fleet) {
                fleet.is_active = activated;
              }
            }
          )
        );
      },
    }),
  }),
});

export const { useGetFleetsQuery, useChangeFleetActiveMutation } =
  fleetTableApi;
