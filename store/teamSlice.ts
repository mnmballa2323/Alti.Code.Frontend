import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Support";
  status: "Active" | "Pending";
  joinedDate: string;
};

const DUMMY_TEAM: TeamMember[] = [
  {
    id: "u-1",
    name: "Ada Lovelace",
    email: "ada@inso.code",
    role: "Owner",
    status: "Active",
    joinedDate: "2026-01-15",
  },
  {
    id: "u-2",
    name: "Grace Hopper",
    email: "grace@inso.code",
    role: "Support",
    status: "Active",
    joinedDate: "2026-03-22",
  },
  {
    id: "u-3",
    name: "Alan Turing",
    email: "alan@inso.code",
    role: "Support",
    status: "Pending",
    joinedDate: "2026-07-08",
  },
];

interface TeamState {
  members: TeamMember[];
}

const initialState: TeamState = {
  members: DUMMY_TEAM,
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<TeamMember>) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
    updateMemberStatus: (
      state,
      action: PayloadAction<{ id: string; status: "Active" | "Pending" }>,
    ) => {
      const member = state.members.find((m) => m.id === action.payload.id);

      if (member) {
        member.status = action.payload.status;
      }
    },
  },
});

export const { addMember, removeMember, updateMemberStatus } =
  teamSlice.actions;
export default teamSlice.reducer;
