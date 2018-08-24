/*
Starting with the code from Namespaces branch + a bit of house keeping; moving permissions related functions
and defentions to it's own module, we are going to do the following:
• Provide a way to easily switch on and off logging (Done)
• Rewrite the totalDistance method in the Trail Class with the Array methods map and reduce (Done)
• Add a TrailRecording Class which can record Trails automatically based on a function that provides the current location
• Refactor the TrailRecording Class into a NameSpace
*/

import * as AC from "./permission"
import "reflect-metadata";

/* If you `npm start` we get a lot of messages because of the logging we implemented. For an easy switch 
enabling or disabling logging we could just use a boolean constant that we defiene. Then, we need to update 
all the logging decorators to check for this option.*/
const logging = false; // test both cases when logging = true and when logging = false

interface Printable {
    toString(): string
}

class Point implements Printable {
    static origin = new Point(0,0);
    constructor(protected x: number, protected y: number) {
    }
    distanceTo(otherPoint : Point) {
        return Math.sqrt( Math.pow(otherPoint.x - this.x,2) + Math.pow(otherPoint.y - this.y,2) )
    }
    toString() { return `Point: (${this.x}, ${this.y})` }
}

function print(source: Printable) {
    console.log(source.toString());
}

class Observation extends Point {
    constructor(x:number, y:number, private timestamp: Date, private height: number) {
        super(x, y)
    }
    toString() {
    return `Observation from: ${this.timestamp},
            at location: (${this.x}, ${this.y}),
            at the height of: ${this.height} m.`;
    }
}

namespace Logging {
    /* The property decorator function logProperty doesn't have a return value so we don't need to care about 
    it's return and can just skip the decorator's code in case logging is switch off. This is done by an 
    empty return statment. */
    export function logProperty(target: Object, propertyKey: string) {
        if(!logging) return;
        let value = target[propertyKey];
        Reflect.deleteProperty(target, propertyKey);
        Reflect.defineProperty(target, propertyKey, {
            get: function() {
                console.log("Get value: ", value);
                return value;
            },
            set: function(newValue) {
                console.log("Set value: ", value);
                value = newValue;
            }
        })
    }

    type Constructor = new(...args: any[]) => any;
    export function logInstanceCreation (target: Constructor) : Constructor {
        class C extends target {
            constructor(...args: any[]) {
                /* The situation is defferent for the class decorators, here wil just wrap the logging statment 
                that we added to the class and method by an if block; checking if logging is turned on or not */
                if(logging) {
                    console.log("New "+ target.name + " Instance Created with Arguments: " + args.join(","));
                }
                super(...args);
            }
        }
        return C;
    }
    
    const logParamsMeta = "logParamsMeta";
    export function logParam(target: Object, propertyKey: string, index: number) {
        let logParams = Reflect.getMetadata(logParamsMeta, target) as Map<string, Set<number>>;
        if(!logParams) {
            logParams = new Map<string, Set<number>>();
        }
        if(!logParams.has(propertyKey)) {
            logParams.set(propertyKey, new Set([index]));
        }
        else {
            let indexSet = logParams.get(propertyKey) as Set<number>;
            indexSet.add(index);
            logParams.set(propertyKey, indexSet);
        }
        Reflect.defineMetadata(logParamsMeta, logParams, target);
        if(logging) {
            console.log(logParams);
        }
    }
    
    export function logMethodParams(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        const indexSet = [...Reflect.getMetadata(logParamsMeta, target).get(propertyKey)]
        const originalValue = descriptor.value;
        descriptor.value = function(...args: any[]) {
            /* The situation is defferent for the method decorators, here wil just wrap the logging statment 
            that we added to the method by an if block. checking if logging is turned on or not */
            if(logging) {
                console.log("Input for method " + propertyKey + ": " + indexSet.map((index) => args[index].toString()).join(", "));
            }
            return originalValue.apply(this, args);
        }
        return descriptor;
    }
}

@Logging.logInstanceCreation
class Trail {
    @Logging.logProperty
    private _coordinates: Point[] = []
    @AC.accessorRequiersPermission(AC.TrailPrivilege.readCoordinates, AC.TrailPrivilege.writeCoordinates)
    get coordinates() : Point[] {
        return this._coordinates;
    }
    set coordinates(newCoordinates : Point[]) {
        this._coordinates = newCoordinates;
    }
    constructor() {
        this._coordinates = [];
    }
    @Logging.logMethodParams
    @AC.methodRequiresPermission(AC.TrailPrivilege.addPoints)
    add(@Logging.logParam point: Point) : Trail {
        this._coordinates.push(point);
        return this;
    }
    @AC.methodRequiresPermission(AC.TrailPrivilege.getDistance)
    totalDistance() : number {
        /* Apply the map method on the trail coordinates to compute an array of distances between two 
        successive points. And then we add up these distances by use of the reduce method. The map method 
        takes a function as input which determines how each individual element should be mapped. */
        const totalDistance = this._coordinates.map((value, index, coord) => {
            /* Since a first element of the coordinates array has no proceeding element, we only compute the 
            distances of all the other points to their successors. For the first element we return a distance 
            of zero. */
            return index > 0 ? coord[index].distanceTo(coord[index-1]) : 0;
        })
        /* On the result of the map method we apply reduce to sum up all the individual distances */
        .reduce((previousValue, currentValue) => previousValue + currentValue);
        /* Finally, return total distance. */
        return totalDistance;
    }
}

const trail = new Trail();
trail.add(new Point(0,0));
trail.add(new Point(1,1));
trail.add(new Point(2,2));
console.log(trail.coordinates);
console.log(trail.totalDistance());

@Logging.logInstanceCreation
class Trek extends Trail {
    add(observation: Observation) : Trail {
        super.add(observation)
        return this;
    }
}

let trek = new Trek();
const obs1 = new Observation(0, 0, new Date(), 1000);
const obs2 = new Observation(1, 1, new Date(), 2000);
const obs3 = new Observation(2, 2, new Date(), 2000);
trek.add(obs1);
trek.add(obs2);
trek.add(obs3);
console.log(trek.coordinates);
console.log(trek.totalDistance());