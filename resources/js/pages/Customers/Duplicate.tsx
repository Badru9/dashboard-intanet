import { DuplicateCustomerInfo, PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Duplicate() {
    const { flash } = usePage<PageProps>().props;

    return (
        <div className="flex flex-col gap-4 p-5">
            {!flash.duplicate_customers_info
                ? null
                : flash.duplicate_customers_info.map((item: DuplicateCustomerInfo, index: number) => {
                      return (
                          <div key={index} className="flex gap-2">
                              <span>{index + 1}.</span>
                              <img
                                  src={`https://ui-avatars.com/api/?name=${item.name}&background=random`}
                                  alt={item.name}
                                  className="aspect-square w-8 rounded-full object-cover"
                              />
                              <p className="text-lg">{item.email}</p>
                          </div>
                      );
                  })}
        </div>
    );
}
