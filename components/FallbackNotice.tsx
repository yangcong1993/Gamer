// file: components/FallbackNotice.tsx

'use client'

const FallbackNotice = () => {
  return (
    <div className="border-primary-400 bg-primary-50 dark:bg-primary-800 my-4 rounded-md border border-l-4 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="text-primary-400 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-primary-700 dark:text-primary-300 text-sm">
            温馨提示：本文当前只有中文版本。
            <span className="text-primary-800 dark:text-primary-200 ml-2 font-medium">
              (This article is currently only available in Chinese.)
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default FallbackNotice
