# mission1

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Environment Variables

프로젝트 루트에 `.env` 파일을 생성하여 API base URL을 설정할 수 있습니다:

```env
# API 설정
VITE_API_BASE_URL=http://43.201.249.207:8080

# 개발 환경에서 사용할 경우 (로컬 서버)
# VITE_API_BASE_URL=http://localhost:8080
```

## API Client

프로젝트는 중앙화된 axios 클라이언트를 사용합니다:

- `src/config/api.ts`: 중앙화된 API 설정 및 axios 클라이언트
- `src/api/`: 각 도메인별 API 함수들 (vmApi, tagApi, networkApi, notificationApi)

모든 API 호출은 `apiClient`를 통해 이루어지며, 기본 헤더와 timeout이 설정되어 있습니다.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# okestro-mission1FE
