let handlersRegistered = false;

export function handleUnexpectedError(): void {
  if (handlersRegistered) return;
  handlersRegistered = true;

  // Promise 에서 발생한 에러가 .catch()로 처리되지 않았을 때
  process.on('unhandledRejection', (reason: any) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    console.error(
      `[Unhandled Rejection] ${err.name}: ${err.message}`,
      err.stack,
    );
  });

  // 동기 코드(또는 콜백 등)에서 던진 에러가 어떤 try/catch에도 잡히지 않았을 때
  process.on('uncaughtException', (error: Error) => {
    console.error(
      `[Uncaught Exception] ${error.name}: ${error.message}`,
      error.stack,
    );
  });
}