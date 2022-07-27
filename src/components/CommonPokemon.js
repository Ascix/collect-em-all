import RandomFromArray from "./RandomFromArray";

export const common = [
    "1",
    "4",
    "7",
    "10",
    "13",
    "16",
    "19",
    "21",
    "23",
    "25",
    "27",
    "29",
    "32",
    "35",
    "37",
    "39",
    "41",
    "43",
    "46",
    "48",
    "50",
    "52",
    "54",
    "56",
    "58",
    "60",
    "63",
    "66",
    "69",
    "72",
    "74",
    "77",
    "79",
    "81",
    "84",
    "86",
    "88",
    "90",
    "92",
    "96",
    "98",
    "100",
    "102",
    "104",
    "109",
    "111",
    "116",
    "118",
    "120",
    "129",
    "147"
]

function CommonPokemon() {
    return (
        RandomFromArray(common)
    )
}

export default CommonPokemon