// Global state to hold Dose Combo data safely
// This file must not import any complex components to avoid circular dependencies

let PENDING_DOSE_COMBO: any = null;

export const setPendingDoseCombo = (data: any) => {
    PENDING_DOSE_COMBO = data;
};

export const getPendingDoseCombo = () => {
    const data = PENDING_DOSE_COMBO;
    PENDING_DOSE_COMBO = null; // Clear after read
    return data;
};
