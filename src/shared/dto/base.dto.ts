export abstract class BaseDto {
    // undefined 값들을 제거하는 toJSON 메서드
    toJSON() {
        return Object.fromEntries(
            Object.entries(this).filter(([_, value]) => value !== undefined)
        );
    }
}
