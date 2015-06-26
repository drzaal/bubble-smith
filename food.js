/**
 * Food provides our basic stats.
 */

var Food = function() {
	this.bulk; // Bulk is how much space taken up by food after eaten.
	this.energy; // How much energy food provides
	this.stamina; // How much energy regeneration the food provides.
	this.vitality; // The maximum amount of energy that can be provided by a food item
	this.stats; // While active, food may provide additional stat modifications. Shove those here for now.
}
