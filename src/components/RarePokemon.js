import RandomFromArray from "./RandomFromArray";

export const rare = [
    "3",
    "6",
    "9",
    "12",
    "15",
    "18",
    "31",
    "34",
    "45",
    "62",
    "65",
    "68",
    "71",
    "76",
    "83",
    "94",
    "106",
    "107",
    "113",
    "114",
    "115",
    "122",
    "123",
    "124",
    "125",
    "126",
    "127",
    "128",
    "131",
    "132",
    "134",
    "135",
    "136",
    "137",
    "139",
    "141",
    "142",
    "143",
    "149",
]
function RarePokemon() {
    return (
        RandomFromArray(rare)
    )
}

export default RarePokemon