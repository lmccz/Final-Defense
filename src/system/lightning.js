import { Rand } from "./utils.js";


const AveragePoint = (point1, point2) =>
{
    return {
        x: Phaser.Math.Average([point1.x, point2.x]),
        y: Phaser.Math.Average([point1.y, point2.y])
    };
}


export class Segment
{
    constructor(startPoint, endPoint, level)
    {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.level = level;
    }

    clone()
    {
        return new Segment(
            { x: this.startPoint.x, y: this.startPoint.y },
            { x: this.endPoint.x, y: this.endPoint.y },
            this.level
        );
    }
}


export class LightningGenerator
{
    generations = 10;
    maximumOffset = 50;
    lengthScale = 0.8;

    constructor(generations = 10, maximumOffset = 50, lengthScale = 0.8)
    {
        this.generations = generations;
        this.maximumOffset = maximumOffset;
        this.lengthScale = lengthScale;
    }

    generate(startPoint, endPoint)
    {
        let segmentList = [];

        segmentList.push(new Segment(startPoint, endPoint, 1));

        let offsetAmount = this.maximumOffset; // the maximum amount to offset a lightning vertex.

        for (let i = 0; i < this.generations; i++)
        {
            let newList = [];

            for (const segmentOld of segmentList)
            {
                let segment = segmentOld.clone();
                let midPoint = AveragePoint(segment.startPoint, segment.endPoint);

                // Offset the midpoint by a random amount along the normal.
                const angle = Math.atan2(segment.endPoint.y - segment.startPoint.y, segment.endPoint.x - segment.startPoint.x);
                const randOffset = Rand(-offsetAmount, offsetAmount);
                const x1 = Math.sin(angle) * randOffset + midPoint.x;
                const y1 = -Math.cos(angle) * randOffset + midPoint.y;
                const x2 = -Math.sin(angle) * randOffset + midPoint.x;
                const y2 = Math.cos(angle) * randOffset + midPoint.y;

                if (Rand(-1, 1) < 0)
                {
                    midPoint.x = x1;
                    midPoint.y = y1;
                } else
                {
                    midPoint.x = x2;
                    midPoint.y = y2;
                }

                // Create two new segments that span from the start point to the end point,
                // but with the new (randomly-offset) midpoint.
                newList.push(new Segment(segment.startPoint, midPoint, segment.level));
                newList.push(new Segment(midPoint, segment.endPoint, segment.level));

                if ( /*Rand(0, 2) < 1 && i % 2 == 0*/ i === 0 || i === 2)
                {
                    const distance = Math.sqrt(Math.pow(midPoint.x - segment.startPoint.x, 2) + Math.pow(midPoint.y - segment.startPoint.y, 2));
                    const splitEnd = { x: segment.endPoint.x, y: segment.endPoint.y };

                    let branchAngle;

                    if (Rand(0, 2) < 1) branchAngle = Rand(-0.8, -0.2);
                    else branchAngle = Rand(0.2, 0.8);

                    Phaser.Math.RotateAroundDistance(
                        splitEnd,
                        midPoint.x,
                        midPoint.y,
                        branchAngle,
                        this.lengthScale * distance
                    );
                    // lengthScale is, for best results, < 1.  0.7 is a good value.
                    newList.push(new Segment(midPoint, splitEnd, segment.level + 1));
                }

            }
            // Each subsequent generation offsets at max half as much as the generation before.
            offsetAmount /= 2;
            segmentList = newList;
        }

        return segmentList;
    }
}