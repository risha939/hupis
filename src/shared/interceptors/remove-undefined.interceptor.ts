// remove-undefined.pipe.ts
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class RemoveUndefinedPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value !== 'object' || value === null) return value;
        return Object.fromEntries(
            Object.entries(value).filter(([_, v]) => v !== undefined)
        );
    }
}
