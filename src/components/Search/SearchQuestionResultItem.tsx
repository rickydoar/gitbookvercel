import IconSearch from '@geist-ui/icons/search';
import Link from 'next/link';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        onClick: () => void;
        recommended?: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { question, recommended = false, active, onClick } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();

    return (
        <Link
            ref={ref}
            onClick={onClick}
            className={tcls(
                'flex',
                'flex-row',
                'px-4',
                'py-2',
                'hover:bg-dark/1',
                'text-dark/7',
                'text-sm',
                'font-medium',
                'first:mt-0',
                'last:pb-3',
                'dark:text-light/8',
                'dark:hover:bg-light/1',
                active ? ['bg-primary-50'] : null,
            )}
            {...getLinkProp({
                ask: true,
                query: question,
            })}
        >
            <IconSearch
                className={tcls(
                    'w-[15px]',
                    'h-[15px]',
                    'shrink-0',
                    'mt-0.5',
                    'mr-2',
                    'stroke-dark/5',
                    'dark:stroke-light/5',
                )}
            />
            {recommended ? question : t(language, 'search_ask', [question])}
        </Link>
    );
});
