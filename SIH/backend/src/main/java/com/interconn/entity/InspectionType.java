package com.interconn.entity;

public enum InspectionType {

    // A government/authority inspection run by a SUPERVISOR
    STATUTORY_INSPECTION,

    // A pre-dispatch self-check run by a MANUFACTURER before shipping product out,
    // to catch label/compliance defects before they reach customers
    DISPATCH_CHECK
}
