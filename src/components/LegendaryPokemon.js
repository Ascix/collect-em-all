import RandomFromArray from "./RandomFromArray";

export const legendary = [
    "144",
    "145",
    "146",
    "150",
    "151",
]
function LegendaryPokemon() {
    return (
        RandomFromArray(legendary)
    )
}

export default LegendaryPokemon