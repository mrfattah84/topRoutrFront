import { apiSlice } from "../../api";

export interface Job {
  load: number[];
  type: string;
  job_id?: number;
  arrival: number;
  service: number;
  distance: number;
  duration: number;
  location: [number, number];
  order_uuid?: string;
  waiting_time: number;
}

export interface orderInJob {
  type: string;
  uuid: string;
  width: number;
  height: number;
  length: number;
  number: number;
  source: string;
  weight: number;
  priority: string;
  stop_time: string;
  destination: string;
  delivery_time_to: string;
  delivery_time_from: string;
}

export interface Jobs {
  optimization_run_id: string;
  optimization_run_created_at: string;
  optimization_run_completed_at: string;
  driver_id: string;
  driver_name: string;
  route: {
    eta: [];
    cost: number;
    load: {
      weight: number;
    };
    steps: Job[];
    orders: orderInJob[];
    geometry: string;
    service_s: number;
    distance_m: number;
    duration_s: number;
    ordered_location_ids: string[];
  };
}

export const liveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get default configuration
    getDriverjobs: builder.query<Jobs, string>({
      query: (id) => ({
        url: `optimization/runs/my-route/?driver_id=${id}`,
      }),
    }),
  }),
});

export const { useGetDriverjobsQuery } = liveApi;
