import RandomFromArray from "./RandomFromArray";

export const uncommon = [
    "2",
    "5",
    "8", 
    "11",
    "14",
    "17",
    "20",
    "22",
    "24",
    "26",
    "28",
    "30",
    "33",
    "36",
    "38",
    "40",
    "42",
    "44",
    "47",
    "49",
    "51",
    "53",
    "55",
    "57",
    "59",
    "61",
    "64",
    "67",
    "70",
    "73",
    "75",
    "78",
    "80",
    "82",
    "85",
    "87",
    "89",
    "91",
    "93",
    "95",
    "97",
    "99",
    "101",
    "103",
    "105",
    "108",
    "110",
    "112",
    "117",
    "119",
    "121",
    "130",
    "133",
    "138",
    "140",
    "148"
]
function UncommonPokemon() {
    return (
        RandomFromArray(uncommon)
    )
}

export default UncommonPokemon