export const RandomStr = () => Math.random().toString(20).slice(2);


export const Rand = (min, max) => min + Math.random() * (max - min);


export const Sleep = time =>
{
    return new Promise((resolve, reject) =>
    {
        setTimeout(() => resolve(), time);
    });
};


export const MapAngleToDirection = angle =>
{
    let direction = 0;

    if (angle >= -45 && angle < 45)
    {
        direction = 1;
    } else if (angle >= 45 && angle < 135)
    {
        direction = 2;
    } else if (angle >= -135 && angle < -45)
    {
        direction = 0;
    } else
    {
        direction = 3;
    }

    return direction;
}


export const secToStrMin = second =>
{
    let min = second / 60 >> 0;
    let sec = second % 60;
    min = min < 10 ? '0' + min : min;
    sec = sec < 10 ? '0' + sec : sec;
    return `${min}:${sec}`;
}


export const TweenPromise = async (scene, obj, props, duration, easingType, delay) =>
{
    easingType = (typeof easingType !== 'undefined' ? easingType : 'Linear');

    if (delay)
    {
        await Sleep(delay);
    }

    await new Promise((resolve, reject) =>
    {
        let options = {
            targets: obj,
            ease: easingType,
            duration: duration,
            yoyo: false,
            repeat: 0,
            onComplete: (tween) =>
            {
                if (tween.progress < 1) return reject();
                return resolve();
            }
        };

        for (let k in props)
        {
            options[k] = props[k];
        };

        scene.tweens.add(options);
    });
};


export const Generate8Uuid = () =>
{
    return 'xxxxxxxx'.replace(/[xy]/g, c =>
    {
        const r = Math.random() * 8 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(8);
    });
}