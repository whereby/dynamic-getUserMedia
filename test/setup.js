"use strict";

const baseDevices = [
    {
        kind: "audioinput",
        label: "Default microphone",
        deviceId: "mic-1",
        groupId: "group-a",
    },
    {
        kind: "audiooutput",
        label: "Default speaker",
        deviceId: "spk-1",
        groupId: "group-a",
    },
    {
        kind: "videoinput",
        label: "Default camera",
        deviceId: "cam-1",
        groupId: "group-b",
    },
];

Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
        getUserMedia: jest.fn(async () => ({
            getTracks: () => [],
            addTrack: () => {},
        })),
        enumerateDevices: jest.fn(async () =>
            baseDevices.map((d) => ({ ...d })),
        ),
        addEventListener: jest.fn(),
    },
});

require("../injected_script.js");
